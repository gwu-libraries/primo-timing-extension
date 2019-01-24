#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import json


# In[ ]:


with open('../firefox_extensions/primo_timing/config.json', 'r') as f:
    config = json.load(f)


# In[ ]:


import sqlalchemy


# In[ ]:


# create the Postgres engine from the credentials in the config file
engine = sqlalchemy.create_engine('postgresql://{user}:{password}@{host}:{port}/{database}'.format(**config['pg_credentials']))


# In[ ]:


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
    (request_id TEXT PRIMARY KEY,
    timestamp NUMERIC,
    payload JSONB,
    type TEXT NOT NULL,
    browser_id INTEGER REFERENCES browser_info)
'''
]


# In[ ]:


for query in sql_create:
    engine.execute(query)

