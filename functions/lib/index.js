"use strict";
/**
 * @fileOverview Funciones Cloud para la aplicación Walletfy.
 *
 * - whatsappWebhook: Un endpoint HTTP para recibir mensajes de WhatsApp.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Inicializar Firebase para que las funciones tengan acceso a otros servicios.
(0, app_1.initializeApp)();
/**
 * Webhook para recibir y procesar mensajes de WhatsApp.
 * Esta función es ahora mucho más simple. Solo recibe el mensaje y lo guarda
 * en una colección de Firestore para que la app principal lo procese.
 */
exports.whatsappWebhook = functions.https.onRequest(async (request, response) => {
    logger.info("Webhook de WhatsApp recibido", { body: request.body });
    const messageText = request.body.Body;
    if (!messageText) {
        logger.warn("No se encontró texto en el cuerpo del mensaje.");
        response.status(400).send("Bad Request: No message body.");
        return;
    }
    // Asumimos que el número de teléfono del usuario viene en el campo 'From'
    // El formato es 'whatsapp:+569...' - lo limpiamos.
    const fromNumber = request.body.From ? String(request.body.From).replace('whatsapp:', '') : null;
    if (!fromNumber) {
        logger.warn("No se encontró el número del remitente ('From').");
        response.status(400).send("Bad Request: No sender number.");
        return;
    }
    try {
        const db = (0, firestore_1.getFirestore)();
        // Guardamos el mensaje en una nueva colección para ser procesado.
        // El documento ID es el número de teléfono para una fácil búsqueda.
        const messageQueueRef = db.collection('incomingWhatsappMessages').doc(fromNumber);
        await messageQueueRef.set({
            text: messageText,
            receivedAt: new Date(),
            processed: false, // Un flag para saber si ya se procesó
            from: fromNumber,
        }, { merge: true });
        logger.info(`Mensaje de ${fromNumber} guardado en Firestore para procesar.`);
        // Respuesta a Twilio
        response.setHeader("Content-Type", "text/xml");
        response.send(`<Response><Message>Tu mensaje está siendo procesado por Walletfy...</Message></Response>`);
    }
    catch (error) {
        logger.error("Error guardando el mensaje de WhatsApp en Firestore:", error);
        response.status(500).send(`<Response><Message>Hubo un error interno procesando tu solicitud.</Message></Response>`);
    }
});
//# sourceMappingURL=index.js.map