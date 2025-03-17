const Chapter = require("./chapterModel");
const Topic = require("./topicModel");
const Comment = require("./commentModel");
const User = require("./userModel");
const Question = require("./questionModel");
const Reaction = require("./reactionModel");
const Exam = require("./examModel");
const ExamUser = require("./examUser");
const SubChapter = require("./subChapterModel");
const Report = require("./reportModel");
const Review = require("./reviewModel");
const Test = require("./testModel");
const TestSubChapter = require("./testSubChapterModel");
const UserAnswer = require("./userAnswerModel");
const Tag = require("./tagModel");
const UserAnswerTag = require("./userAnswerTag");
const ChatExplanation = require("./chatExplanationModel");
const Channel = require("./channelModel");
const Video = require("./videoModel");
const ReactionVideo = require("./reactionVideoModel");
const Bookmark = require("./bookmarkModel");
const ForumPost = require("./forumPostModel");
const ForumCategory = require("./forumCategoryModel");
const Hashtag = require('./forumHashtagmodel');
const PostHashtag = require('./forumPostHashtagModel');
const ForumComment = require('./forumComment');
const PostReaction = require('./forumPostReaction');
const ForumCommentReaction = require('./forumCommentReactionModel');
const Article = require('./articleModel');
const ArticleSection = require('./articlesectionModel');
const Dictionary = require('./dictionaryModel');
const Avis = require('./avisModel');
const Cours = require('./coursModel');
const SupportTicket = require('./SupportTicketModel');
const SupportMessage = require('./SupportMessageModel');

// Définir la relation entre Chapter et Topic
Chapter.belongsTo(Topic, {
  foreignKey: "topic_id",
  as: "topic",
});

Topic.hasMany(Chapter, {
  foreignKey: "topic_id",
  as: "chapters",
});

Comment.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

// Définir la relation entre Comment et User
Comment.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

Comment.hasMany(Reaction, {
  foreignKey: "comment_id",
  as: "reactions",
});

Exam.hasMany(ExamUser, { foreignKey: "exam_id", as: "examUsers" });

ExamUser.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });
ExamUser.belongsTo(Question, { foreignKey: "question_id", as: "question" });

Question.hasMany(ExamUser, { foreignKey: "question_id", as: "exam_users" });

// Définir la relation entre Question et SubChapter
Question.belongsTo(SubChapter, {
  foreignKey: "sub_chapter_id",
  as: "sub_chapter",
});

Question.hasMany(Comment, {
  foreignKey: "question_id",
  as: "comments",
});

// Définir la relation entre Reaction et User
Reaction.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

// Définir la relation entre Reaction et Comment
Reaction.belongsTo(Comment, {
  foreignKey: "comment_id",
  as: "comment",
});

Report.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

// Define the relationship between Review and User
Review.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

User.hasMany(Review, {
  foreignKey: "user_id",
  as: "reviews",
});

// Define the relationship between Review and Question
Review.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

Question.hasMany(Review, {
  foreignKey: "question_id",
  as: "reviews",
});
// Définir la relation inverse pour Chapter
Chapter.hasMany(SubChapter, {
  foreignKey: "chapter_id",
  as: "subChapters",
});
// Définir la relation entre SubChapter et Chapter
SubChapter.belongsTo(Chapter, {
  foreignKey: "chapter_id",
  as: "chapters",
});

// Définir la relation entre Test et User
Test.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

User.hasMany(Test, {
  foreignKey: "user_id",
  as: "tests",
});

// Définir la relation entre TestSubChapter et Test
TestSubChapter.belongsTo(Test, {
  foreignKey: "test_id",
  as: "test",
});

Test.hasMany(TestSubChapter, {
  foreignKey: "test_id",
  as: "test_sub_chapters",
});

Topic.hasMany(Exam, { foreignKey: "topic_id", as: "exams" });
Exam.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Exam.belongsTo(User, { foreignKey: "user_id",  targetKey: "clerkId", as: "user"});

// Définir les relations entre UserAnswer et les autres modèles
UserAnswer.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

User.hasMany(UserAnswer, {
  foreignKey: "user_id",
  as: "user_answers",
});

UserAnswer.belongsTo(Question, {
  foreignKey: "question_id",
  as: "questions",
});

Question.hasMany(UserAnswer, {
  foreignKey: "question_id",
  as: "user_answers",
});

UserAnswer.belongsTo(TestSubChapter, {
  foreignKey: "testSubChapter_id",
  as: "testSubChapter",
});

TestSubChapter.hasMany(UserAnswer, {
  foreignKey: "testSubChapter_id",
  as: "user_answers",
});

UserAnswer.hasMany(UserAnswerTag, {
  foreignKey: "user_answer_id",
  as: "user_answer_tags",
});

UserAnswerTag.belongsTo(Tag, { foreignKey: "tag_id", as: "tags" });

ChatExplanation.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

Question.hasMany(ChatExplanation, {
  foreignKey: "question_id",
  as: "chatExplanations",
});

// Relation avec la table User (clé étrangère `user_id`)
ChatExplanation.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

Channel.hasMany(Video, { foreignKey: "channel_id", as: "videos" });

Video.belongsTo(Channel, { foreignKey: "channel_id", as: "channel" });

Topic.hasMany(Video, { foreignKey: "topic_id", as: "videos" });

Video.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });

Video.hasMany(ReactionVideo, { foreignKey: "video_id", as: "reaction_videos" });

User.hasMany(ReactionVideo, { foreignKey: "user_id", as: "reaction_videos" });

ReactionVideo.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "users",
});

ReactionVideo.belongsTo(Video, { foreignKey: "video_id", as: "videos" });

User.hasMany(ForumPost, { foreignKey: "user_id", as: "forum_posts" });
ForumPost.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "clerkId",
  as: "user",
});

ForumCategory.hasMany(ForumPost, {
  foreignKey: "category_id",
  as: "forum_posts",
});
ForumPost.belongsTo(ForumCategory, {
  foreignKey: "category_id",
  as: "forum_category",
});


// Un post peut avoir plusieurs hashtags, un hashtag peut appartenir à plusieurs posts
ForumPost.belongsToMany(Hashtag, { through: PostHashtag, as:"hashtags", foreignKey: 'post_id' });
Hashtag.belongsToMany(ForumPost, { through: PostHashtag, as:"forum_posts", foreignKey: 'hashtag_id' });

// Associer Hashtag à PostHashtag (important pour que Hashtag reconnaisse PostHashtag)
Hashtag.hasMany(PostHashtag, { foreignKey: 'hashtag_id', as:"post_hashtags" });
PostHashtag.belongsTo(Hashtag, { foreignKey: 'hashtag_id', as:"hashtag" });


// Un post peut avoir plusieurs commentaires
ForumPost.hasMany(ForumComment, { foreignKey: 'post_id', as:"forum_comments" });
ForumComment.belongsTo(ForumPost, { foreignKey: 'post_id', as:"forum_post" });

// Un utilisateur peut écrire plusieurs commentaires
User.hasMany(ForumComment, { foreignKey: 'user_id', as:"forum_comments" });
ForumComment.belongsTo(User, { foreignKey: 'user_id', as:"user", targetKey: "clerkId" });

// Un commentaire peut avoir des réponses (auto-référence)
ForumComment.hasMany(ForumComment, { foreignKey: 'parent_comment_id', targetKey:"id", as: 'replies' });
ForumComment.belongsTo(ForumComment, { foreignKey: 'parent_comment_id', targetKey:"id", as: 'parent' });


// Un post peut avoir plusieurs réactions
ForumPost.hasMany(PostReaction, { foreignKey: 'post_id', onDelete: 'CASCADE', as: "post_reactions" });
PostReaction.belongsTo(ForumPost, { foreignKey: 'post_id', as: "forum_post" });

// Un utilisateur peut réagir à plusieurs posts
User.hasMany(PostReaction, { foreignKey: 'user_id', onDelete: 'CASCADE', as: "post_reactions" });
PostReaction.belongsTo(User, { foreignKey: 'user_id', as: "user", targetKey: "clerkId" });

// Association entre User et ForumCommentReaction
User.hasMany(ForumCommentReaction, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'forum_comment_reactions' });
ForumCommentReaction.belongsTo(User, { foreignKey: 'user_id', as: 'user', targetKey: "clerkId" });

// Association entre Comment et ForumCommentReaction
ForumComment.hasMany(ForumCommentReaction, { foreignKey: 'comment_id', onDelete: 'CASCADE', as: 'forum_comment_reactions' });
ForumCommentReaction.belongsTo(ForumComment, { foreignKey: 'comment_id', as: 'comment' });

// Définition de la relation entre Article et Section
Article.hasMany(ArticleSection, { foreignKey: "article_id", as: "articles_sections" });
ArticleSection.belongsTo(Article, { foreignKey: "article_id", as: "article" });


// Un topic peut avoir plusieurs cours
Topic.hasMany(Cours, {
  foreignKey: "topic_id",
  as: "cours",
});

// Un cours appartient à un seul topic
Cours.belongsTo(Topic, {
  foreignKey: "topic_id",
  as: "topic",
});

// Un ticket de support peut avoir plusieurs messages
SupportTicket.hasMany(SupportMessage, {
  foreignKey: "ticketId",
  as: "messages",
});

// Un message appartient à un ticket de support
SupportMessage.belongsTo(SupportTicket, {
  foreignKey: "ticketId",
  as: "ticket",
});

User.hasMany(SupportTicket, { foreignKey: "userId", onDelete: "CASCADE" });
SupportTicket.belongsTo(User, { foreignKey: "userId", targetKey: "clerkId", onDelete: "CASCADE" })

module.exports = {
  Chapter,
  SubChapter,
  Topic,
  Comment,
  User,
  Question,
  Reaction,
  Exam,
  ExamUser,
  Report,
  Review,
  Test,
  TestSubChapter,
  UserAnswer,
  Tag,
  UserAnswerTag,
  ChatExplanation,
  Video,
  Channel,
  ReactionVideo,
  Bookmark,
  ForumPost,
  ForumCategory,
  Hashtag,
  PostHashtag,
  ForumComment,
  PostReaction,
  ForumCommentReaction,
  Article,
  ArticleSection,
  Dictionary,
  Avis,
  Cours,
  SupportTicket,
  SupportMessage,
};
