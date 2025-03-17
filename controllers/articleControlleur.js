const {Article, ArticleSection} = require("../models");
const { getImageUrl } = require("../services/s3Service");



// ➤ 1. Créer un article avec ses sections
exports.createArticle = async (req, res) => {
  try {
    const { title, title_image, title_text, sections } = req.body;

    const article = await Article.create({ title, title_image, title_text });

    if (sections && sections.length > 0) {
      const sectionsData = sections.map((section) => ({
        ...section,
        article_id: article.id,
      }));
      await ArticleSection.bulkCreate(sectionsData);
    }

    res.status(201).json({ message: "Article créé avec succès", article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [{ model: ArticleSection, as: "articles_sections" }],
    });

    // Modifier les URLs des images des articles et des sections
    const formattedArticles = await Promise.all(
      articles.map(async (article) => {
        
        const image_url =  getImageUrl(article.title_image, "blog");

        return {
          ...article.toJSON(),
          title_image: image_url,
          articles_sections: await Promise.all(
            article.articles_sections.map(async (section) => {
              

            const section_image_url = getImageUrl(section.section_image, "blog");

              return {
                ...section.toJSON(),
                section_image: section_image_url,
              };
            })
          ),
        };
      })
    );

    res.status(200).json(formattedArticles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id, {
      include: [{ model: ArticleSection, as: "articles_sections" }],
    });

    if (!article) return res.status(404).json({ message: "Article non trouvé" });

    const image_url = getImageUrl(article.title_image, "blog");

    const formattedArticle = {
      ...article.toJSON(),
      title_image: image_url,
      articles_sections: await Promise.all(
        article.articles_sections.map(async (section) => {
         
            const section_image_url = getImageUrl(section.section_image, "blog");

          return {
            ...section.toJSON(),
            section_image: section_image_url,
          };
        })
      ),
    };

    res.status(200).json(formattedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ➤ 4. Mettre à jour un article avec ses sections
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_image, title_text, sections } = req.body;

    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article non trouvé" });

    await article.update({ title, title_image, title_text });

    if (sections) {
      await ArticleSection.destroy({ where: { article_id: id } });

      const sectionsData = sections.map((section) => ({
        ...section,
        article_id: id,
      }));
      await ArticleSection.bulkCreate(sectionsData);
    }

    res.status(200).json({ message: "Article mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ 5. Supprimer un article et ses sections associées
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article non trouvé" });

    await article.destroy();

    res.status(200).json({ message: "Article supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
