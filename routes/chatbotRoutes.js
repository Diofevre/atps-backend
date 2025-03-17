const express = require("express");
const router = express.Router();
const openai = require("../config/openai");
const AviationService = require("../services/aviationService");
const LoggingService = require("../services/loggingService");
const {generateSystemMessage} = require("../services/systemMessage");

router.post("/", async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, question_id = null } = req.body;
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch relevant explanations from the aviation knowledge base
    const explanations = await AviationService.findRelevantExplanations(
      message
    );

    const currectQuestions = await AviationService.currectQuestions(question_id);

    const conversationHistory = await  LoggingService.getConversationHistory(userId,5)


    const systemMessage =  generateSystemMessage(explanations, currectQuestions, conversationHistory);


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const responseTime = Date.now() - startTime;

   const logs =  await LoggingService.logInteraction({
      userId,
      question: message,
      response: response,
      explanations: explanations,
      responseTime: responseTime,
      status: "success",
    });


    res.json({ id: logs.id, response, date: logs.date });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("Error:", error);

    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    await LoggingService.logInteraction({
      userId,
      question: req.body.message,
      response: "",
      explanations: [],
      responseTime: responseTime,
      status: "error",
      errorMessage: error.message,
    });

    res.status(500).json({ error: "Error communicating with the chatbot" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const logs = await LoggingService.getLogs(userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs" });
  }
});

router.put("/logs/:logId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { logId } = req.params;
    const { newMessage, question_id } = req.body;

    if (!newMessage || newMessage.trim() === "") {
      return res.status(400).json({ error: "New message cannot be empty" });
    }

    // Vérifiez si le log appartient à l'utilisateur
    const log = await LoggingService.getLogById(logId);
    if (!log || log.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized to modify this log" });
    }

    const currectQuestions = await AviationService.currectQuestions(question_id);

    // Récupérez les explications pertinentes pour le nouveau message
    const explanations = await AviationService.findRelevantExplanations(newMessage);

    const conversationHistory = await  LoggingService.getConversationHistory(userId,5)

    const systemMessage =  generateSystemMessage(explanations, currectQuestions, conversationHistory);


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: newMessage },
      ],
      temperature: 0.7,
    });

    const newResponse = completion.choices[0].message.content;

    // Mettre à jour le message et la réponse dans la base de données
   const logs =  await LoggingService.updateUserMessageAndResponse(
      logId,
      newMessage,
      newResponse,
      explanations
    );

    res.json({
      id: logs.id,
      response: newResponse,
      date: logs.date
    });

  } catch (error) {
    console.error("Erreur lors de la modification du message et de la réponse:", error);
    res.status(500).json({ error: "Error updating the message and response" });
  }
});

router.delete("/delete/:logId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { logId } = req.params;

    // Appeler la méthode pour supprimer le log
    const result = await LoggingService.deleteLog(logId, userId);

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression du log:", error);
    res.status(500).json({ error: "Error deleting the log" });
  }
});




module.exports = router;
