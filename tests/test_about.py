import unittest
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
PAGES=['index.html','dog/index.html','cat/index.html','dog/thanks/index.html','cat/thanks/index.html']
class Tags(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
class AboutTests(unittest.TestCase):
 def test_pages(self):
  for file in PAGES:
   p=ROOT/file;s=p.read_text();tags=Tags(s).tags
   self.assertEqual(sum(1 for _,a in tags if 'data-pondd-character' in a),1)
   ids=[a['id'] for _,a in tags if 'id' in a];self.assertEqual(len(ids),len(set(ids)))
   for tag,a in tags:
    for key in ['href','src']:
     v=a.get(key,'')
     if 'pondd-character/' in v:self.assertTrue((p.parent/v).is_file(),v)
   self.assertEqual(sum(1 for tag,a in tags if a.get('href','').startswith('https://www.youtube.com/@')),3)
   for script in ['scoreboard.js','counter.js','analytics.js']:self.assertIn(script,s)
   self.assertIn('PONDD WEBSITE NETWORK START',s)
 def test_original_model(self):
  self.assertIn('https://pond1982.github.io/screenshot-studio/models/pondd.glb',(ROOT/'pondd-character/character.js').read_text())
if __name__=='__main__':unittest.main()
