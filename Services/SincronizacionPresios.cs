using GEOGAS.Api.Data;
using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Models; 
using System.Threading.Tasks;
using System.Net.Http;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Xml.Linq; 
using System.Globalization; 
using System;
using System.Text.Json; 

/// <summary>
/// Implementa la lógica de fetch de la API externa (que devuelve XML) y la sincronización con MyDbContext.
/// </summary>
public class DataSyncService : IDataSyncService
{
    private readonly MyDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly ILogger<DataSyncService> _logger;
    
    // El BaseAddress es "https://publicacionexterna.azurewebsites.net/publicaciones/prices"
    private const string ApiEndpoint = ""; 

    public DataSyncService(MyDbContext context, ILogger<DataSyncService> logger)
    {
        _context = context;
        _logger = logger;
        _httpClient = new HttpClient(); 
        // URL base proporcionada por el usuario
        _httpClient.BaseAddress = new Uri("https://publicacionexterna.azurewebsites.net/publicaciones/prices"); 
        _httpClient.Timeout = TimeSpan.FromSeconds(60); 
    }

    public async Task<bool> SyncGasPricesAsync()
    {
        string fullUrl = _httpClient.BaseAddress + ApiEndpoint;
        _logger.LogInformation($"Iniciando sincronización de precios de gas desde API externa (XML). URL: {fullUrl}");
        
        try
        {
            // 1. REALIZAR EL FETCH
            var response = await _httpClient.GetAsync(ApiEndpoint);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Fallo HTTP. Código de estado: {response.StatusCode}. URL: {fullUrl}.");
                return false;
            }

            var xmlResponse = await response.Content.ReadAsStringAsync();
            List<Presio_Gas> externalPrices = new List<Presio_Gas>();

            try
            {
                XDocument doc = XDocument.Parse(xmlResponse);
                
                // --- LÓGICA CLAVE: CONVERSIÓN DE XML (ATRIBUTOS) A OBJETOS ---
                
                // Usamos SelectMany para aplanar la estructura (una gasolinera tiene varios precios)
                externalPrices = doc.Descendants("place") 
                    .SelectMany(placeNode => 
                    {
                        // 1. Obtener el ID de la gasolinera (atributo "place_id")
                        var placeIdAttr = placeNode.Attribute("place_id");
                        if (placeIdAttr == null || !int.TryParse(placeIdAttr.Value, out int gasolinerasPlaceId))
                        {
                            _logger.LogWarning($"Nodo <place> omitido: Atributo 'place_id' no encontrado o no es un entero. XML: {placeNode}");
                            return Enumerable.Empty<Presio_Gas>();
                        }

                        // 2. Por cada <place>, iterar sobre los nodos <gas_price>
                        return placeNode.Elements("gas_price")
                            .Select(priceNode =>
                            {
                                // Obtener el tipo de gas (atributo "type")
                                var typeAttr = priceNode.Attribute("type");
                                string tipoGas = typeAttr?.Value ?? "desconocido";

                                // Obtener y parsear el precio (el contenido del nodo).
                                if (decimal.TryParse(priceNode.Value, 
                                                     NumberStyles.AllowDecimalPoint, 
                                                     CultureInfo.InvariantCulture, 
                                                     out decimal precioDecimal))
                                {
                                    // Retorna un objeto Presio_Gas (no nulo)
                                    return new Presio_Gas
                                    {
                                        Gasolinerasplace_id = gasolinerasPlaceId,
                                        tipo = tipoGas,
                                        presio = Convert.ToInt32(precioDecimal)
                                    };
                                }
                                else
                                {
                                    _logger.LogWarning($"Precio omitido en place_id {gasolinerasPlaceId}: El valor '{priceNode.Value}' no es un decimal válido.");
                                    return null; // Retorna null si falla el parseo
                                }
                            })
                            // === CORRECCIÓN CS8619 ===
                            // OfType<T> filtra los elementos nulos (que son de tipo object) 
                            // y castea el resultado a IEnumerable<T> no nulo.
                            .OfType<Presio_Gas>() 
                            .ToList(); 
                    })
                    .ToList();
                
                // --- FIN LÓGICA CLAVE ---

            }
            catch (Exception xmlEx) when (xmlEx is System.Xml.XmlException || xmlEx is InvalidOperationException || xmlEx is FormatException)
            {
                _logger.LogError(xmlEx, $"Error al parsear o convertir el XML de la URL: {fullUrl}. La estructura del XML puede haber cambiado o el formato es incorrecto.");
                return false;
            }

            if (!externalPrices.Any())
            {
                 _logger.LogWarning($"La API externa ({fullUrl}) devolvió una lista de precios vacía o nula después de parsear el XML.");
                 return true; 
            }
            
            // 2. PROCESAR Y ACTUALIZAR LA BASE DE DATOS (Lógica de Upsert)

            var currentPrices = await _context.presio_Gas.ToListAsync();
            var changesCount = 0;

            foreach (var externalPrice in externalPrices)
            {
                // Clave compuesta: Gasolinera ID + Tipo de Gas
                var existingPrice = currentPrices.FirstOrDefault(p => 
                        p.Gasolinerasplace_id == externalPrice.Gasolinerasplace_id && 
                        p.tipo.Equals(externalPrice.tipo, StringComparison.OrdinalIgnoreCase));

                if (existingPrice != null)
                {
                    // Si existe, actualiza si el precio es diferente
                    if (existingPrice.presio != externalPrice.presio)
                    {
                        existingPrice.presio = externalPrice.presio;
                        changesCount++;
                    }
                }
                else
                {
                    // Si no existe, inserta
                    _context.presio_Gas.Add(externalPrice);
                    changesCount++;
                }
            }
            
            // 3. GUARDAR LOS CAMBIOS
            if (changesCount > 0)
            {
                var savedChanges = await _context.SaveChangesAsync();
                _logger.LogInformation($"Sincronización completada. {savedChanges} registros de precios de gas actualizados/insertados.");
            }
            else
            {
                 _logger.LogInformation("Sincronización completada. No se detectaron cambios en los precios.");
            }
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fatal general durante el proceso de sincronización de la DB al consultar {fullUrl}.");
            return false;
        }
    }
}