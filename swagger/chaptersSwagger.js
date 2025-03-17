module.exports = {
    "definitions": {
      "Chapter": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "example": 101
          },
          "chapter_text": {
            "type": "string",
            "example": "Introduction to Air Law"
          },
          "topic_id": {
            "type": "integer",
            "example": 1
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
  