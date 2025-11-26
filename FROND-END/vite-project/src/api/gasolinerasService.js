// src/api/gasolinerasService.js

/**
 * Función para enviar los datos actualizados de una gasolinera al controlador .NET (PUT /api/Gasolineras/{id}).
 * NOTA: Esta función es usada para la edición manual por parte del Administrador.
 * * @param {number} place_id - El ID único de la gasolinera.
 * @param {object} nuevosDatos - Objeto con los datos actualizados.
 * @returns {Promise<boolean>} - True si la actualización fue exitosa (código 204).
 */
export async function actualizarGasolinera(place_id, nuevosDatos) {
    const urlApi = `/api/Gasolineras/${place_id}`; 
    
    // Aseguramos que el place_id también vaya en el cuerpo, como espera el controlador C#
    const datosConId = { 
        ...nuevosDatos, 
        place_id: place_id 
    };

    try {
        const respuesta = await fetch(urlApi, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // *IMPORTANTE*: Se requiere el token JWT del Admin aquí para pasar el [Authorize]
                // 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` 
            },
            body: JSON.stringify(datosConId),
        });

        if (respuesta.status === 204) {
            console.log('✅ Gasolinera actualizada con éxito.');
            return true;
        } else {
            const error = await respuesta.text();
            throw new Error(`Error al actualizar (${respuesta.status}): ${error}`);
        }
    } catch (error) {
        console.error('🚨 Fallo la operación PUT Fetch:', error);
        throw error;
    }
}


// =========================================================================================
// NUEVA FUNCIÓN: SINCRONIZACIÓN DE DATOS EXTERNOS
// =========================================================================================

/**
 * Función para disparar la sincronización de datos desde la API externa 
 * (https://publicacionexterna.azurewebsites.net/publicaciones/places) 
 * hacia la base de datos local de .NET.
 * * Llama al endpoint POST /api/Gasolineras/sincronizar.
 * @returns {Promise<number>} - El número de nuevos registros guardados.
 */
export async function sincronizarDatosExternos() {
    const urlApi = '/api/Gasolineras/sincronizar';

    try {
        const respuesta = await fetch(urlApi, {
            method: 'POST', // Usamos POST para iniciar la acción
            headers: {
                'Content-Type': 'application/json',
                // *IMPORTANTE*: Se requiere el token JWT del Admin aquí
                // 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` 
            },
            // No se necesita cuerpo (body) ya que los datos los obtiene el backend
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // El controlador devuelve un objeto con la propiedad 'nuevos_guardados'
            console.log(`✅ Sincronización exitosa. Se guardaron ${data.nuevos_guardados} registros nuevos.`);
            return data.nuevos_guardados;
        } else {
            // Manejo de errores de la API (.NET)
            const mensajeError = data.mensaje || 'Error desconocido del servidor.';
            throw new Error(`Error al sincronizar (${respuesta.status}): ${mensajeError}`);
        }

    } catch (error) {
        console.error('🚨 Fallo la operación POST/Sincronización Fetch:', error);
        throw error;
    }
}