"""
Анализирует фотографию вещи (одежды, аксессуара, обуви) и выдаёт рекомендацию
подходит ли она клиенту согласно его лук-буку и психологическим нюансам.
"""
import json
import os
import base64
import psycopg2
from openai import OpenAI


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    assistant_id = body.get('assistant_id', '').strip()
    image_data = body.get('image_data', '').strip()
    image_mime = body.get('image_mime', 'image/jpeg')

    if not assistant_id or not image_data:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимы assistant_id и image_data'})
        }

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"SELECT client_name, lookbook_url, notes FROM {schema}.assistants WHERE id = %s",
        (assistant_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ассистент не найден'})
        }

    client_name, lookbook_url, notes = row

    system_prompt = f"""Ты — персональный AI-ассистент стилиста для клиента по имени {client_name}.

Твоя задача: анализировать фотографии вещей (одежды, аксессуаров, обуви, сумок) и давать честную, конкретную рекомендацию — подходит ли эта вещь клиенту.

{"Дополнительные психологические нюансы от стилиста: " + notes if notes else ""}

Формат ответа — строго JSON:
{{
  "verdict": "да" или "нет" или "зависит",
  "emoji": "✅" или "❌" или "🤔",
  "summary": "одна короткая фраза-вывод (до 10 слов)",
  "reasons": ["причина 1", "причина 2", "причина 3"],
  "tip": "практический совет как носить или с чем сочетать (если verdict не нет)"
}}

Будь конкретным, тёплым, профессиональным. Отвечай только JSON, без markdown."""

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Посмотри на эту вещь и дай рекомендацию согласно моему стилю."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{image_mime};base64,{image_data}"
                    }
                }
            ]
        }
    ]

    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        max_tokens=600,
        temperature=0.4,
    )

    raw = response.choices[0].message.content.strip()
    result = json.loads(raw)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result, ensure_ascii=False)
    }
