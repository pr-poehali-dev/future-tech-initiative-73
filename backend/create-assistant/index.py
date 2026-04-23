"""
Создаёт персонального ассистента стилиста для клиента.
Принимает: имя клиента, файл лук-бука (base64), психологические нюансы.
Сохраняет лук-бук в S3, создаёт запись в БД, возвращает ссылку для клиента.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3


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
    client_name = body.get('client_name', '').strip()
    notes = body.get('notes', '').strip()
    file_data = body.get('file_data')
    file_name = body.get('file_name', 'lookbook.pdf')

    if not client_name:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Имя клиента обязательно'})
        }

    lookbook_url = None
    lookbook_filename = None

    if file_data:
        raw = base64.b64decode(file_data)
        ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'pdf'
        key = f"lookbooks/{uuid.uuid4()}.{ext}"

        content_types = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
        }
        content_type = content_types.get(ext, 'application/octet-stream')

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=content_type)
        lookbook_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        lookbook_filename = file_name

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {schema}.assistants (client_name, lookbook_url, lookbook_filename, notes) "
        f"VALUES (%s, %s, %s, %s) RETURNING id",
        (client_name, lookbook_url, lookbook_filename, notes)
    )
    assistant_id = str(cur.fetchone()[0])
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'id': assistant_id,
            'client_name': client_name,
        })
    }
