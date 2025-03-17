module.exports = {
    "definitions": {
    "SubChapter": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "example": 201
          },
          "sub_chapter_text": {
            "type": "string",
            "example": "Definitions and Terminology"
          },
          "chapter_id": {
            "type": "integer",
            "example": 101
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "example": "2024-12-01T12:00:00Z"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time",
            "example": "2024-12-01T12:00:00Z"
          },
          "deleted_at": {
            "type": "string",
            "format": "date-time",
            "example": null
          }
        }
      },
    }
};
