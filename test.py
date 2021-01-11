from unittest import TestCase
from app import app
from flask import session, json
from boggle import Boggle



class FlaskTests(TestCase):
    def setUp(self):
      self.client = app.test_client()
      # Make Flask errors be real errors, not HTML pages with error info
      app.config['TESTING'] = True
      # This is a bit of hack, but don't use Flask DebugToolbar
      app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

    # def tearDown(self):
    #   """Stuff to do after each test."""

    def test_index(self):
        with self.client:
            res = self.client.get("/")
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code, 200)
            self.assertIn('<h1 id="title">Boggle!</h1>', html)

    def test_guess_word(self):
        with self.client as client:
            with client.session_transaction() as change_session:
                change_session['board'] = [["A", "B", "C", "D", "E"], 
                                           ["A", "B", "C", "D", "E"],
                                           ["A", "T", "E", "S", "T"], 
                                           ["A", "B", "C", "D", "E"], 
                                           ["A", "B", "C", "D", "E"],]
                res = client.post('/guess', data=json.dumps({'guess': 'test'}), content_type='application/json')
                html = res.get_data(as_text=True)
                
                self.assertEqual(res.json['result'], 'ok')
                # self.assertEqual(res.status_code, 200)
                # self.assertIn('<div id="message" class="error">\'asdf\' is not a valid word</div>', html)
