using System.Threading.Tasks;

// Esta interfaz define el contrato para el servicio que maneja la lógica de fetch y actualización de la DB.
public interface IDataSyncService
{
    /// <summary>
    /// Ejecuta el proceso de sincronización de datos: realiza el fetch a la API externa 
    /// y actualiza los precios de gas en la base de datos.
    /// </summary>
    /// <returns>Verdadero si la sincronización fue exitosa, falso en caso contrario.</returns>
    Task<bool> SyncGasPricesAsync();
}