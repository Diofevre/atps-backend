const { Test } = require('./models/testModel');  // Assurez-vous d'importer le modèle 'Test'
const { User } = require('./models/userModel');  // Assurez-vous d'importer le modèle 'User'

// Exemple de fonction pour insérer un test pour un utilisateur spécifique
const createTestForUser = async () => {
  try {
    // Créer une nouvelle entrée pour le test
    const newTest = await Test.create({
      user_id: 1,           // ID de l'utilisateur (par exemple, l'ID 1)
      is_finished: false,    // Le test n'est pas encore terminé
      timespent: null,       // Temps passé (peut être null pour l'instant)
      score: 0,              // Le score initial
      total_question: 10,    // Exemple de nombre total de questions
      finished_question: 0,  // Le nombre de questions terminées
    });

    console.log('Test created successfully:', newTest);
    return newTest;
  } catch (error) {
    console.error('Error creating test:', error);
  }
};

// Appeler directement la fonction pour créer un test pour l'utilisateur avec ID 1
createTestForUser();
