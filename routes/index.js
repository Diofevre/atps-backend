require('dotenv').config()
const express = require('express');
const { clerkMiddleware } = require('@clerk/express');
const { checkSubscription, premiumOnly } = require("../middlewares/authMiddleware");
const topicRoutes = require('./topicRoutes');
const chapterRoutes = require('./chapterRoutes');
const subChapterRoutes = require('./subChapterRoutes');
const testRoutes = require('./testRoutes');
const questionRoutes = require('./questionRoutes');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const reactionRoutes = require('./reactionsRoutes');
const reviewRoutes = require('./reviewRoutes');
const reportRoutes = require('./reportRoutes');
const examRoutes = require('./examRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const chatbotLessonsRoutes = require('./chatbotLessonRoutes');
const videoRoutes = require('./videoRoutes');
const reactionsVideoRoutes = require('./reactionVideoRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const forumCategorieRoutes = require('./forumCategorieRoutes');
const forumHastagRoutes = require('./forumHastagRoutes');
const forumPostRoutes = require('./forumPostRoutes');
const forumPostReactionRoutes = require('./forumPostReactionRoutes');
const forumCommentRoutes = require('./forumCommentRoutes');
const forumCommentReactionRoutes = require('./forumCommentReactionRoutes');
const articleRoutes = require('./articleRoutes');
const dictionaryRoutes = require('./dictionnaryRoutes');
const avisRoutes = require('./avisRoutes');
const newsRoutes = require('./newsRoutes');
const supportRoutes = require('./supportRoutes');
const router = express.Router();

 
// Appliquer clerkMiddleware pour attacher l'objet auth à toutes les requêtes
router.use(clerkMiddleware());


// Associer chaque fichier de routes à un chemin spécifique

router.use('/topics', checkSubscription, topicRoutes); 
router.use('/tests', checkSubscription, testRoutes);     
router.use('/chapters', checkSubscription, chapterRoutes); 
router.use('/subchapters', checkSubscription, subChapterRoutes);  
router.use('/questions', checkSubscription, questionRoutes);
router.use('/users',checkSubscription, userRoutes);
router.use('/comments', checkSubscription, commentRoutes);
router.use('/reactions', checkSubscription, reactionRoutes);
router.use('/reviews', checkSubscription, reviewRoutes);
router.use('/reports', checkSubscription, reportRoutes);
router.use('/exams', checkSubscription, examRoutes);
router.use('/chat', checkSubscription, chatbotRoutes);
router.use('/chat_lessons', checkSubscription, chatbotLessonsRoutes);
router.use('/videos', checkSubscription, videoRoutes);
router.use('/reactions_videos', checkSubscription, reactionsVideoRoutes);
router.use('/dashboard', checkSubscription, dashboardRoutes);
router.use('/forum-categories', forumCategorieRoutes);
router.use('/forum-hashtags', forumHastagRoutes);
router.use('/forum-posts', forumPostRoutes);
router.use('/forum-post-reactions', forumPostReactionRoutes);
router.use('/forum-comments', forumCommentRoutes);
router.use('/forum-comment-reactions', forumCommentReactionRoutes);
router.use('/articles', articleRoutes);
router.use('/dictionary', checkSubscription, dictionaryRoutes);
router.use('/avis', avisRoutes);
router.use('/latest-news', newsRoutes);
router.use('/support/tickets', supportRoutes);

module.exports = router;
