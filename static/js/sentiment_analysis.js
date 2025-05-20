document.addEventListener('DOMContentLoaded', function() {
  const sentimentForm = document.getElementById('sentiment-form');
  const feedbackTextInput = document.getElementById('feedback-text');
  const resetButton = document.getElementById('reset-form');
  const resultSection = document.getElementById('result-section');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // Reset form
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      if (sentimentForm) {
        sentimentForm.reset();
        
        if (resultSection) {
          resultSection.classList.add('d-none');
        }
      }
    });
  }
  
  // Handle form submission
  if (sentimentForm) {
    sentimentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic client-side validation
      if (!feedbackTextInput.value.trim()) {
        showAlert('Please enter employee feedback to analyze', 'danger');
        return;
      }
      
      // Show loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
      }
      
      // Submit form with AJAX
      const formData = new FormData(sentimentForm);
      
      fetch('/analyze-sentiment', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.display = 'none';
        }
        
        if (data.success) {
          displaySentimentAnalysis(data.result);
        } else {
          showAlert(data.error || 'An error occurred during sentiment analysis', 'danger');
        }
      })
      .catch(error => {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.display = 'none';
        }
        
        showAlert('Error submitting form: ' + error.message, 'danger');
      });
    });
  }
  
  // Display sentiment analysis results
  function displaySentimentAnalysis(result) {
    if (resultSection) {
      // Make result section visible
      resultSection.classList.remove('d-none');
      
      // Set sentiment score and label
      const sentimentScoreEl = document.getElementById('sentiment-score');
      const sentimentLabelEl = document.getElementById('sentiment-label');
      
      if (sentimentScoreEl) {
        const score = result.sentiment_score || 0;
        sentimentScoreEl.textContent = score.toFixed(2);
        
        // Update sentiment marker position
        const sentimentMarker = document.getElementById('sentiment-marker');
        if (sentimentMarker) {
          // Convert score from -1 to 1 range to 0 to 100% for positioning
          const position = ((score + 1) / 2) * 100;
          sentimentMarker.style.left = `${position}%`;
        }
      }
      
      if (sentimentLabelEl) {
        sentimentLabelEl.textContent = result.primary_sentiment || 'Unknown';
        
        // Set color based on sentiment
        const sentiment = result.primary_sentiment || '';
        if (sentiment.toLowerCase().includes('positive')) {
          sentimentLabelEl.className = 'badge bg-success';
        } else if (sentiment.toLowerCase().includes('negative')) {
          sentimentLabelEl.className = 'badge bg-danger';
        } else if (sentiment.toLowerCase().includes('neutral')) {
          sentimentLabelEl.className = 'badge bg-secondary';
        } else if (sentiment.toLowerCase().includes('mixed')) {
          sentimentLabelEl.className = 'badge bg-warning';
        } else {
          sentimentLabelEl.className = 'badge bg-secondary';
        }
      }
      
      // Display key themes
      const keyThemesList = document.getElementById('key-themes');
      if (keyThemesList) {
        keyThemesList.innerHTML = '';
        if (result.key_themes && result.key_themes.length > 0) {
          result.key_themes.forEach(theme => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary me-2 mb-2';
            badge.textContent = theme;
            keyThemesList.appendChild(badge);
          });
        } else {
          keyThemesList.innerHTML = '<p class="text-muted">No key themes identified</p>';
        }
      }
      
      // Display positive aspects
      const positiveList = document.getElementById('positive-aspects');
      if (positiveList) {
        positiveList.innerHTML = '';
        if (result.positive_aspects && result.positive_aspects.length > 0) {
          result.positive_aspects.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${item}`;
            positiveList.appendChild(li);
          });
        } else {
          positiveList.innerHTML = '<li class="list-group-item text-muted">No positive aspects identified</li>';
        }
      }
      
      // Display concerns
      const concernsList = document.getElementById('concerns');
      if (concernsList) {
        concernsList.innerHTML = '';
        if (result.concerns && result.concerns.length > 0) {
          result.concerns.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<i class="fas fa-exclamation-circle text-danger me-2"></i>${item}`;
            concernsList.appendChild(li);
          });
        } else {
          concernsList.innerHTML = '<li class="list-group-item text-muted">No concerns identified</li>';
        }
      }
      
      // Display attrition risk
      const attritionRiskEl = document.getElementById('attrition-risk');
      const attritionReasoningEl = document.getElementById('attrition-reasoning');
      
      if (attritionRiskEl && result.attrition_risk) {
        const riskLevel = result.attrition_risk.level || 'unknown';
        attritionRiskEl.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
        
        // Set color based on risk level
        if (riskLevel.toLowerCase() === 'high') {
          attritionRiskEl.className = 'badge bg-danger';
        } else if (riskLevel.toLowerCase() === 'medium') {
          attritionRiskEl.className = 'badge bg-warning';
        } else if (riskLevel.toLowerCase() === 'low') {
          attritionRiskEl.className = 'badge bg-success';
        } else {
          attritionRiskEl.className = 'badge bg-secondary';
        }
      }
      
      if (attritionReasoningEl && result.attrition_risk) {
        attritionReasoningEl.textContent = result.attrition_risk.reasoning || 'No reasoning provided';
      }
      
      // Display recommendations
      const recommendationsList = document.getElementById('recommendations');
      if (recommendationsList) {
        recommendationsList.innerHTML = '';
        if (result.engagement_recommendations && result.engagement_recommendations.length > 0) {
          result.engagement_recommendations.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<i class="fas fa-lightbulb text-warning me-2"></i>${item}`;
            recommendationsList.appendChild(li);
          });
        } else {
          recommendationsList.innerHTML = '<li class="list-group-item text-muted">No recommendations available</li>';
        }
      }
      
      // Display summary
      const summaryEl = document.getElementById('analysis-summary');
      if (summaryEl) {
        summaryEl.textContent = result.summary || 'No summary available';
      }
      
      // Initialize/update sentiment distribution chart
      updateSentimentChart(result);
      
      // Scroll to results
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Update the sentiment chart
  function updateSentimentChart(result) {
    // This function would be implemented in charts.js
    if (typeof initializeSentimentChart === 'function') {
      initializeSentimentChart(result);
    }
  }
  
  // Helper function to show alerts
  function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        alertsContainer.removeChild(alert);
      }, 150);
    }, 5000);
  }
});
