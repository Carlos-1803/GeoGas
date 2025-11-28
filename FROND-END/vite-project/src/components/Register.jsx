import React, { useState } from 'react';
import './Auth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5287'; 
  const REGISTER_ENDPOINT = '/api/auth/register';

  const handleChange = (e) => {
    setError('');
    setSuccess('');
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validaciones del frontend
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setIsLoading(false);
      return;
    }

    const payload = {
      Nombre: formData.name,
      Correo: formData.email,
      Contraseña: formData.password
    };

    try {
      console.log('Enviando solicitud de registro a:', API_BASE_URL + REGISTER_ENDPOINT);
      
      const response = await fetch(API_BASE_URL + REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Respuesta recibida, status:', response.status);

      let data = {};
      try {
        data = await response.json();
        console.log('Datos recibidos:', data);
      } catch (jsonError) {
        console.error('Error parseando JSON:', jsonError);
        if (!response.ok) {
          setError(`Error del servidor (${response.status}). No se pudo procesar la respuesta.`);
          return;
        }
      }

      if (response.ok) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        
        // Guardar el token si se recibió
        if (data.token) {
          localStorage.setItem('userToken', data.token);
          console.log('✅ Token guardado en localStorage:', data.token);
        } else {
          console.warn('⚠️ No se recibió token del servidor');
        }

        // Guardar información del usuario si está disponible
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          onRegister();
        }, 2000);

      } else {
        let errorMessage = `Error (${response.status}) al registrar.`;
        
        if (response.status === 409) {
          errorMessage = data.Message || 'El correo electrónico ya está registrado.';
        } else if (response.status === 400 && data.errors) {
          // Manejar errores de validación del backend
          const firstErrorKey = Object.keys(data.errors)[0];
          errorMessage = `Error de validación: ${data.errors[firstErrorKey][0]}`;
        } else if (data.Message) {
          errorMessage = data.Message;
        } else if (data.title) {
          // Para errores estándar de .NET
          errorMessage = data.title;
        }
        
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Error de red/servidor:', err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Decoraciones de fondo */}
      <div className="auth-decoration decoration-1">🚗</div>
      <div className="auth-decoration decoration-2">⭐</div>
      <div className="auth-decoration decoration-3">🔑</div>
      
      <div className="auth-header">
        <h1>GeoGas</h1>
        <p>Crea tu cuenta gratuita</p>
      </div>
      
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        
        {/* Mensajes de feedback */}
        {error && (
          <div className="validation-message error">
            {error}
          </div>
        )}
        {success && (
          <div className="validation-message success">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              required
              minLength="8"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <span className="auth-link" onClick={onSwitchToLogin}>Inicia Sesión</span></p>
        </div>
      </div>
    </div>
  );
};

export default Register;