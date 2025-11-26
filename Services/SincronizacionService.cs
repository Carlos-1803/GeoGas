using System.Net.Http;
using System.Xml.Linq; // Necesario para trabajar con XML
using GEOGAS.Models;
using GEOGAS.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System;

namespace GEOGAS.Api.Services
{
    public class SincronizacionService
    {
        private readonly MyDbContext _context;
        private readonly HttpClient _httpClient;
        private const string API_URL = "https://publicacionexterna.azurewebsites.net/publicaciones/places";

        public SincronizacionService(MyDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<int> SincronizarGasolinerasAsync()
        {
            int nuevosRegistros = 0;
            
            // 1. Obtener el XML de la URL externa
            var response = await _httpClient.GetAsync(API_URL);
            response.EnsureSuccessStatusCode(); 

            var xmlString = await response.Content.ReadAsStringAsync();
            var xmlDocument = XDocument.Parse(xmlString);

            // 2. Convertir XML a una lista de objetos Gasolineras usando LINQ to XML
            // Elemento Contenedor Principal: <places>
            // Elemento de Cada Gasolinera: <place>
            var gasolinerasExternas = xmlDocument.Descendants("place") // <-- Ahora buscamos el elemento <place>
                .Select(g => 
                {
                    // 1. Obtener place_id del ATRIBUTO "place_id"
                    int.TryParse(g.Attribute("place_id")?.Value, out int pid);

                    // 2. Acceder a los elementos anidados en <location>
                    var locationElement = g.Element("location");
                    double xVal = 0.0;
                    double yVal = 0.0;
                    
                    if (locationElement != null)
                    {
                        double.TryParse(locationElement.Element("x")?.Value, out xVal);
                        double.TryParse(locationElement.Element("y")?.Value, out yVal);
                    }
                    
                    return new Gasolineras
                    {
                        place_id = pid,
                        // Elementos directos de <place>
                        Nombre = g.Element("name")?.Value ?? string.Empty, // <-- Usamos <name>
                        cre_id = g.Element("cre_id")?.Value ?? string.Empty,
                        // Coordenadas anidadas
                        x = xVal,
                        y = yVal
                    };
                })
                .Where(g => g.place_id > 0)
                .ToList();
                
            Console.WriteLine($"Total de registros parseados con place_id válido: {gasolinerasExternas.Count}");

            if (!gasolinerasExternas.Any())
            {
                Console.WriteLine("AVISO: No se encontró ningún registro válido en el XML. Revise la estructura.");
                return 0;
            }

            // 3. Iterar y guardar solo los nuevos (lógica anti-duplicados)
            foreach (var gasolineraExterna in gasolinerasExternas)
            {
                // Usamos el 'place_id' como identificador único
                var existe = await _context.Gasolinera
                                           .AnyAsync(g => g.place_id == gasolineraExterna.place_id);

                if (!existe)
                {
                    Console.WriteLine($"--> Guardando nuevo registro: ID {gasolineraExterna.place_id}, Nombre: {gasolineraExterna.Nombre}");
                    _context.Gasolinera.Add(gasolineraExterna);
                    nuevosRegistros++;
                }
                else
                {
                    // Este es el caso que te estaba dando el resultado 0. 
                    // Significa que el registro ya existía en tu DB.
                    Console.WriteLine($"--- Saltando registro existente: ID {gasolineraExterna.place_id}");
                }
            }

            // 4. Persistir los cambios
            if (nuevosRegistros > 0)
            {
                await _context.SaveChangesAsync();
            }

            return nuevosRegistros;
        }
    }
}