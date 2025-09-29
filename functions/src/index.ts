/**
 * @fileOverview Funciones Cloud para la aplicación Walletfy.
 *
 * - whatsappWebhook: Un endpoint HTTP para recibir mensajes de WhatsApp.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { processTransactions } from "./flows/process-transactions.js";
import { initializeApp } from "firebase-admin/app";

// Inicializar Firebase para que las funciones tengan acceso a otros servicios.
initializeApp();

/**
 * Webhook para recibir y procesar mensajes de WhatsApp.
 */
export const whatsappWebhook = onRequest(
  { cors: true }, // Permitir CORS para pruebas iniciales
  async (request, response) => {
    logger.info("Webhook de WhatsApp recibido", { body: request.body });

    // En una implementación real, aquí se validaría la firma de Twilio/proveedor.
    
    // El texto del mensaje vendría en `request.body.Body` para Twilio.
    const messageText = request.body.Body;

    if (!messageText) {
      logger.warn("No se encontró texto en el cuerpo del mensaje.");
      response.status(400).send("Bad Request: No message body.");
      return;
    }

    try {
      // TODO: En el futuro, estos datos se leerán desde la base de datos de Firestore del usuario.
      const simulatedContext = {
        categories: ["Comida", "Transporte", "Sueldo", "Ventas", "Cuentas", "Restaurantes"],
        profiles: ["Personal", "Negocio"],
        accounts: [
            { id: "acc_1", name: "Cuenta Corriente Personal" },
            { id: "acc_2", name: "Cuenta de Ahorro" },
            { id: "acc_3", name: "Tarjeta de Crédito Negocio" },
        ],
      };

      logger.info(`Analizando el texto: "${messageText}" con Genkit...`);

      const result = await processTransactions({ 
        text: messageText,
        ...simulatedContext
      });
      
      logger.info("Resultado del análisis de Genkit:", { result });

      const successMessage = `¡Transacción analizada! Se encontraron ${result.transactions.length} transacciones.`;

      // Para Twilio, respondemos con un formato especial (TwiML).
      response.setHeader("Content-Type", "text/xml");
      response.send(`<Response><Message>${successMessage}</Message></Response>`);
      
    } catch (error) {
      logger.error("Error procesando el mensaje de WhatsApp con Genkit:", error);
      response.status(500).send(`<Response><Message>Hubo un error procesando tu solicitud.</Message></Response>`);
    }
  }
);
