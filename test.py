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

      self.test_board = [["A", "B", "C", "D", "E"], 
                         ["A", "B", "C", "D", "E"],
                         ["A", "T", "E", "S", "T"], 
                         ["A", "B", "C", "D", "E"], 
                         ["A", "B", "C", "D", "E"],]

    def test_index(self):
        with self.client:
            res = self.client.get("/")
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code, 200)
            self.assertIn('<h1 id="title">Boggle!</h1>', html)

    def test_word_accepted(self):
        with self.client as client:
            with client.session_transaction() as change_session:
                change_session['board'] = self.test_board
            res = client.post('/guess', data=json.dumps({'guess': 'test'}), content_type='application/json')
                
            self.assertEqual(res.json['result'], 'ok')
            self.assertEqual(res.status_code, 200)
    
    def test_not_a_word(self):
        with self.client as client:
            with client.session_transaction() as change_session:
                change_session['board'] = self.test_board
            res = client.post('/guess', data=json.dumps({'guess': 'asdf'}), content_type='application/json')
                
            self.assertEqual(res.json['result'], 'not-word')
            self.assertEqual(res.status_code, 200)  

    def test_not_on_board(self):
        with self.client as client:
            with client.session_transaction() as change_session:
                change_session['board'] = self.test_board
            res = client.post('/guess', data=json.dumps({'guess': 'dog'}), content_type='application/json')
                
            self.assertEqual(res.json['result'], 'not-on-board')
            self.assertEqual(res.status_code, 200)          

    def test_game_over(self):
        with self.client as client:
            with client.session_transaction() as change_session:
                change_session['high_score'] = 25
                change_session['games_played'] = 50

            # test not setting high score
            res = client.post('/game-over', data=json.dumps({'score': 20}), content_type='application/json')
            self.assertEqual(res.json['newHighScore'], False)
            self.assertEqual(session['high_score'], 25)
            self.assertEqual(session['games_played'], 51)
            self.assertEqual(res.status_code, 200)
            
            # test setting high score
            res = client.post('/game-over', data=json.dumps({'score': 99}), content_type='application/json')
            self.assertEqual(res.json['newHighScore'], True)
            self.assertEqual(session['high_score'], 99)
            self.assertEqual(session['games_played'], 52)
            self.assertEqual(res.status_code, 200)
            
