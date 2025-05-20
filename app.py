import os
import logging
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for, session
from werkzeug.utils import secure_filename
import tempfile
import json
from utils.resume_parser import extract_text_from_pdf, extract_text_from_docx
from utils.gemini_api import analyze_resume_with_gemini, analyze_sentiment_with_gemini
from dotenv import load_dotenv
load_dotenv()
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure upload settings
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Set Gemini API key - this needs to be provided through environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
print(GEMINI_API_KEY)
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/resume-screening')
def resume_screening():
    return render_template('resume_screening.html')

@app.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    try:
        # Check if job description is provided
        job_description = request.form.get('job_description', '')
        if not job_description:
            flash('Please provide a job description', 'error')
            return redirect(url_for('resume_screening'))
        
        # Check if file is provided
        if 'resume' not in request.files:
            flash('No file part', 'error')
            return redirect(url_for('resume_screening'))
        
        file = request.files['resume']
        if file.filename == '':
            flash('No selected file', 'error')
            return redirect(url_for('resume_screening'))
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Extract text based on file type
            if filename.endswith('.pdf'):
                resume_text = extract_text_from_pdf(filepath)
            elif filename.endswith('.docx'):
                resume_text = extract_text_from_docx(filepath)
            else:
                flash('Unsupported file format', 'error')
                return redirect(url_for('resume_screening'))
            
            # Remove temporary file
            os.remove(filepath)
            
            # Process with Gemini API
            analysis_result = analyze_resume_with_gemini(resume_text, job_description, GEMINI_API_KEY)
            
            # Store results in session for display
            session['resume_analysis'] = analysis_result
            
            # Return JSON if AJAX request, otherwise redirect
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': True, 'result': analysis_result})
            else:
                flash('Resume analysis completed successfully', 'success')
                return redirect(url_for('resume_screening'))
                
    except Exception as e:
        app.logger.error(f"Error analyzing resume: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': str(e)})
        else:
            flash(f'Error processing resume: {str(e)}', 'error')
            return redirect(url_for('resume_screening'))

@app.route('/sentiment-analysis')
def sentiment_analysis():
    return render_template('sentiment_analysis.html')

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        feedback_text = request.form.get('feedback_text', '')
        if not feedback_text:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'error': 'Please provide employee feedback text'})
            else:
                flash('Please provide employee feedback text', 'error')
                return redirect(url_for('sentiment_analysis'))
        
        # Process with Gemini API
        sentiment_result = analyze_sentiment_with_gemini(feedback_text, GEMINI_API_KEY)
        
        # Store results in session for display
        session['sentiment_analysis'] = sentiment_result
        
        # Return JSON if AJAX request, otherwise redirect
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': True, 'result': sentiment_result})
        else:
            flash('Sentiment analysis completed successfully', 'success')
            return redirect(url_for('sentiment_analysis'))
            
    except Exception as e:
        app.logger.error(f"Error analyzing sentiment: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': str(e)})
        else:
            flash(f'Error processing sentiment: {str(e)}', 'error')
            return redirect(url_for('sentiment_analysis'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


