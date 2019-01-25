#!/usr/bin/env python
# coding: utf-8

import json
import sqlalchemy

def init_db():
    with open('config.json', 'r') as f:
        config = json.load(f)
    # create the Postgres engine from the credentials in the config file
    engine = sqlalchemy.create_engine('postgresql://{user}:{password}@{host}:{port}/{database}'.format(**config['pg_credentials']))

    sql_create = ['''
    CREATE TABLE browser_info 
        (browser_id SERIAL PRIMARY KEY,
        os TEXT,
        arch TEXT,
        name TEXT,
        vendor TEXT,
        version TEXT,
        buildID TEXT)
    ''',
    '''
    CREATE TABLE ils_events
        (request_id TEXT,
        timestamp NUMERIC,
        payload JSONB,
        type TEXT NOT NULL,
        browser_id INTEGER REFERENCES browser_info)
    '''
    ]

    for query in sql_create:
        engine.execute(query)
    print("Tables successfully created.")
    return

if __name__ == '__main__':
    init_db()
