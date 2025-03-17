const pool = require("../config/database");

class LoggingService {
  static async logInteraction({
    userId, // Ajout de userId
    question,
    response,
    explanations,
    responseTime,
    status = "success",
    errorMessage = null,
  }) {
    try {
      const query = `
          INSERT INTO chatbot_lessons 
          (user_id, user_question, ai_response, relevant_explanations, response_time, status, error_message)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

      const [result] = await pool.execute(query, [
        userId, // Ajout de userId dans la requête
        question,
        response,
        JSON.stringify(explanations),
        responseTime,
        status,
        errorMessage,
      ]);
      const insertedId = result.insertId;

      const [rows] = await pool.execute(
        "SELECT updatedAt, id FROM chatbot_lessons WHERE id = " + insertedId,
      );

      if (rows.length > 0) {
        const dateCreated = new Date(rows[0].updatedAt);
        return { id: rows[0].id, date: dateCreated.toUTCString() };
      } else {
        throw new Error("No record found with the given ID");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du log:", error);
    }
  }

  static async getLogs(userId, limit = 100) {
    try {
      const [logs] = await pool.execute(
        "SELECT * FROM chatbot_lessons WHERE user_id = '" + userId + "' ORDER BY createdAt DESC LIMIT "+limit,
      );
  
      // Formatage de la date `updated_at` en UTC
      return logs.map((log) => ({
        id: log.id,
        user_question: log.user_question,
        ai_response: log.ai_response,
        user_id: log.user_id,
        updated_at: new Date(log.updated_at).toUTCString(), // Format UTC
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      throw error;
    }
  }
  

  static async getLogById(logId) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM chatbot_lessons WHERE id = ?",
        [logId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du log:", error);
      throw error;
    }
  }
  static async updateUserMessageAndResponse(
    logId,
    newMessage,
    newResponse,
    explanations
  ) {
    try {
      const query = `
        UPDATE chatbot_lessons 
        SET user_question = ?, ai_response = ?, relevant_explanations = ?
        WHERE id = ?
      `;
  
      await pool.execute(query, [
        newMessage,
        newResponse,
        JSON.stringify(explanations),
        logId,
      ]);
  
      // Récupérer la date de mise à jour après l'exécution
      const [rows] = await pool.execute(
        "SELECT updatedAt FROM chatbot_lessons WHERE id = ?",
        [logId]
      );
  
      if (rows.length > 0) {
        const updatedAt = new Date(rows[0].updatedAt); // Convertit en objet Date
        return {
          success: true,
          message: "Message and response updated successfully",
          id: logId,
          date: updatedAt.toUTCString(),
        };
      } else {
        throw new Error("Log not found after update");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du message et de la réponse:",
        error
      );
      throw error;
    }
  }
  

  static async getConversationHistory(userId, limit) {
    try {
      const [logs] = await pool.execute(
        `SELECT user_question, ai_response 
           FROM chatbot_lessons 
           WHERE user_id = '` +
          userId +
          `' 
           ORDER BY createdAt DESC
           LIMIT ` +
          limit
      );

      // Construire l'historique sous forme de chaîne formatée
      const conversationHistory = logs
        .map(
          (log) => `User: ${log.user_question}\nAssistant: ${log.ai_response}`
        )
        .join("\n\n");

      return conversationHistory;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique de conversation:",
        error
      );
      throw error;
    }
  }

  static async deleteLog(logId, userId) {
    try {
      // Vérifier que le log appartient bien à l'utilisateur avant suppression
      const [rows] = await pool.execute(
        "SELECT id FROM chatbot_lessons WHERE id = "+ logId +" AND user_id = '"+ userId +"'",
      );
  
      if (rows.length === 0) {
        throw new Error("Unauthorized or log not found");
      }
  
      // Supprimer le log
      await pool.execute("DELETE FROM chatbot_lessons WHERE id = "+logId);
  
      return { success: true, message: "Log deleted successfully" };
    } catch (error) {
      console.error("Erreur lors de la suppression du log:", error);
      throw error;
    }
  }
  
}

module.exports = LoggingService;
