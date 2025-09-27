/**
 * @fileOverview Funciones Cloud para la aplicación Walletfy.
 *
 * - whatsappWebhook: Un endpoint HTTP para recibir mensajes de WhatsApp.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { processTransactions } from "./flows/process-transactions";
import { initializeApp } from "firebase-admin/app";

// Inicializar Firebase para que las funciones tengan acceso a otros servicios.
initializeApp();

/**
 * Webhook para recibir y procesar mensajes de WhatsApp.
 * Por ahora, solo simula el procesamiento.
 */
export const whatsappWebhook = onRequest(
  { cors: true }, // Permitir CORS para pruebas iniciales
  async (request, response) => {
    logger.info("Webhook de WhatsApp recibido", { body: request.body });

    // En una implementación real, aquí se validaría la firma de Twilio.
    
    // El texto del mensaje vendría en `request.body.Body` para Twilio.
    const messageText = request.body.Body;

    if (!messageText) {
      logger.warn("No se encontró texto en el cuerpo del mensaje.");
      response.status(400).send("Bad Request: No message body.");
      return;
    }

    try {
      // Por ahora, solo registramos que intentaríamos procesar.
      // En el siguiente paso, llamaremos aquí al flow de Genkit.
      logger.info(`Simulando procesamiento para: "${messageText}"`);

      // TODO: Llamar al flow 'processTransactions' aquí.
      // const result = await processTransactions({ text: messageText, ... });
      
      // Simulación de respuesta exitosa.
      const successMessage = `Mensaje recibido: "${messageText}". El procesamiento con IA se implementará en el siguiente paso.`;

      // Para Twilio, respondemos con un formato especial (TwiML).
      response.setHeader("Content-Type", "text/xml");
      response.send(`<Response><Message>${successMessage}</Message></Response>`);
      
    } catch (error) {
      logger.error("Error procesando el mensaje de WhatsApp:", error);
      response.status(500).send("Internal Server Error");
    }
  }
);
