const baseSwagger = require('./baseSwagger');
const topicsSwagger = require('./topicsSwagger');
const chaptersSwagger = require('./chaptersSwagger');
const sub_chapterSwagger = require('./subChaptersSwagger');
const testswagger = require('./testSwagger');
const questionsSwagger = require('./questionsSwagger');
const usersSwagger = require('./usersSwagger');
const commentsSwagger = require('./commentsSwagger');
const reactionsSwagger = require('./reactionsSwagger');
const reviewsSwagger = require('./reviewSwagger');
const reportsSwagger = require('./reportsSwagger');
const examSwagger = require('./examSwagger');
const chatbotSwagger = require('./chatbotSwagger');
const chatbotLessonsSwagger = require('./chatLessonsSwagger');
const videoSwagger = require('./videoSwagger');
const reactionVideoSwagger = require('./reactionVideoSwagger');
const bookmarkSwagger = require('./bookmarkSwagger');
const dashboardSwagger = require('./dashboardSwagger');
const forumCategorySwagger = require('./forumCategorySwagger');
const forumHashtagSwagger = require('./forumHashtagsSwagger');
const forumPostSwagger = require('./forumPostSwagger');
const forumPostReactionSwagger = require('./forumPostReactionSwaggers');
const forumCommentSwagger = require('./forumCommentSwagger');
const forumCommentReactionSwagger = require('./forumCommentReactionSwagger');
const Chapterswagger = require('./chapterSwagger');
const subChapterSwagger = require('./subChapterSwagger');
const articleSwagger = require('./articleSwagger');
const dictionarySwagger = require('./dictionarySwagger');
const avisSwagger = require('./avisSwagger');
const newsSwagger = require('./newsSwagger');
const subscriptionSwagger = require('./subscriptionSwagger');
const supportSwagger = require('./supportSwagger');

const swaggerDocument = {
  ...baseSwagger,
  tags: [
    { name: "Topics", description: "Endpoints liés aux sujets" },
    { name: "Tests", description: "Endpoints liés aux tests" },
    { name: "Questions", description: "Endpoints liés aux questions" },
    { name: "Users", description: "Endpoints liés aux utilisateurs" },
    { name: "Comments", description: "Endpoints liés aux commentaires" },
    { name: "Reactions", description: "Endpoints liés aux réactions" },
    { name: "Reviews", description: "Endpoints liés aux avis" },
    { name: "Reports", description: "Endpoints liés aux rapports" },
    { name: "Exams", description: "Endpoints liés aux examens" },
    { name: "Chatbot", description: "Endpoints liés au chatbot" },
    { name: "ChatbotLessons", description: "Endpoints liés aux leçons du chatbot" },
    { name: "Videos", description: "Endpoints liés aux vidéos" },
    { name: "ReactionVideos", description: "Endpoints liés aux réactions aux vidéos" },
    { name: "Bookmarks", description: "Endpoints liés aux marqueurs" },
    { name: "Dashboard", description: "Endpoints liés à la tableau de bord" },
    { name: "Forum Categories", description: "Endpoints liés aux catégories du forum" },
    { name: "Forum Hashtags", description: "Endpoints liés aux hashtags du forum" },
    { name: "Forum Posts", description: "Endpoints liés aux posts du forum" },
    { name: "Forum Post Reactions", description: "Endpoints liés aux réactions aux posts du forum" },
    {name: "Forum Comments", description: "Endpoints liés aux comments aux posts du forum" },
    {name: "Forum Comment Reactions", description: "Endpoints liés aux réactions aux commentaires d'un post du forum" },
    { name: "Chapters", description: "Endpoints liés aux chapitres" },
    { name: "SubChapters", description: "Endpoints liés aux sous-chapitres" },
    { name: "Articles", description: "Endpoints liés aux articles" },
    { name: "Dictionary", description: "Endpoints liés aux dictionnaires" },
    { name: "Avis", description: "Endpoints liés aux avis" },
    { name: "News", description: "Endpoints liés aux news" },
    { name: "Subscription", description: "Endpoints liés aux abonnements" },
    { name: "Support", description: "Endpoints liés à la support" },
  ],
  paths: {
    ...topicsSwagger,
    ...Chapterswagger,
    ...subChapterSwagger,
    ...testswagger,
    ...questionsSwagger,
    ...usersSwagger,
    ...commentsSwagger,
    ...reactionsSwagger,
    ...reviewsSwagger,
    ...reportsSwagger,
    ...examSwagger,
    ...chatbotSwagger,
    ...videoSwagger,
    ...reactionVideoSwagger,
    ...chatbotLessonsSwagger,
    ...bookmarkSwagger,
    ...dashboardSwagger,
    ...forumCategorySwagger,
    ...forumHashtagSwagger,
    ...forumPostSwagger,
    ...forumPostReactionSwagger, 
    ...forumCommentSwagger,
    ...forumCommentReactionSwagger,
    ...articleSwagger,
    ...dictionarySwagger,
    ...avisSwagger,
    ...newsSwagger,
    ...subscriptionSwagger,
    ...supportSwagger,  
    
  },
  definitions: {
    "Topic": topicsSwagger.definitions.Topic,
    "Chapter": chaptersSwagger.definitions.Chapter,
    "SubChapter": sub_chapterSwagger.definitions.SubChapter,
    "Question": questionsSwagger.definitions.QuestionAnswerResponse,
    "User": usersSwagger.definitions.User,
    'Comment': commentsSwagger.definitions.Comment,
    'Reactions': reactionsSwagger.definitions.Reaction,
    'Review': reviewsSwagger.definitions.Review,
    'Report': reportsSwagger.definitions.Report,
    'Exam': examSwagger.definitions.Exam,
    'Log': chatbotSwagger.definitions.Log,
    'Video': videoSwagger.definitions.Video,
    'ReactionVideo': reactionVideoSwagger.definitions.ReactionVideo,
    'ForumCategory': forumCategorySwagger.definitions.ForumCategory,
    'ForumHashtag': forumHashtagSwagger.definitions.Hashtag,
    'ForumPost' : forumPostSwagger.definitions.ForumPost,
    "ForumPostReaction": forumPostReactionSwagger.definitions.PostReaction,
    "ForumCommentReaction": forumCommentReactionSwagger.definitions.CommentReaction,
    'Chapter': Chapterswagger.definitions.Chapter,
    'SubChapter': subChapterSwagger.definitions.SubChapter,
    'Article': articleSwagger.definitions.Article,
    'Dictionary': dictionarySwagger.definitions.DictionaryEntry,
    'Avis': avisSwagger.definitions.Avis,
    'SupportTicket': supportSwagger.definitions.SupportTicket,
    'SupporMessage': supportSwagger.definitions.SupportMessage
  }
};

module.exports = swaggerDocument;
