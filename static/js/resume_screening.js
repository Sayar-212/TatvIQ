document.addEventListener('DOMContentLoaded', function() {
  const resumeForm = document.getElementById('resume-form');
  const resumeFileInput = document.getElementById('resume-file');
  const jobDescriptionInput = document.getElementById('job-description');
  const fileNameDisplay = document.getElementById('file-name');
  const resetButton = document.getElementById('reset-form');
  const resultSection = document.getElementById('result-section');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // Initialize file input display
  if (resumeFileInput) {
    resumeFileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
        fileNameDisplay.parentElement.classList.remove('d-none');
      } else {
        fileNameDisplay.textContent = '';
        fileNameDisplay.parentElement.classList.add('d-none');
      }
    });
  }
  
  // Reset form
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      if (resumeForm) {
        resumeForm.reset();
        fileNameDisplay.textContent = '';
        fileNameDisplay.parentElement.classList.add('d-none');
        
        if (resultSection) {
          resultSection.classList.add('d-none');
        }
      }
    });
  }
  
  // Handle form submission
  if (resumeForm) {
    resumeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic client-side validation
      if (!resumeFileInput.files.length) {
        showAlert('Please select a resume file', 'danger');
        return;
      }
      
      if (!jobDescriptionInput.value.trim()) {
        showAlert('Please enter a job description', 'danger');
        return;
      }
      
      // Show loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
      }
      
      // Submit form with AJAX
      const formData = new FormData(resumeForm);
      
      fetch('/analyze-resume', {
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
          displayResumeAnalysis(data.result);
        } else {
          showAlert(data.error || 'An error occurred during resume analysis', 'danger');
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
  
  // Display resume analysis results
  function displayResumeAnalysis(result) {
    if (resultSection) {
      // Make result section visible
      resultSection.classList.remove('d-none');
      
      // Set values in the result display
      const matchScore = document.getElementById('match-score');
      if (matchScore) {
        matchScore.textContent = result.match_score || '0';
      }
      
      // Update match score gauge
      updateMatchScoreGauge(result.match_score || 0);
      
      // Display extracted skills
      const extractedSkillsList = document.getElementById('extracted-skills');
      if (extractedSkillsList) {
        extractedSkillsList.innerHTML = '';
        if (result.extracted_skills && result.extracted_skills.length > 0) {
          result.extracted_skills.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary skill-badge';
            badge.textContent = skill;
            extractedSkillsList.appendChild(badge);
          });
        } else {
          extractedSkillsList.innerHTML = '<p class="text-muted">No skills extracted</p>';
        }
      }
      
      // Display matching skills
      const matchingSkillsList = document.getElementById('matching-skills');
      if (matchingSkillsList) {
        matchingSkillsList.innerHTML = '';
        if (result.matching_skills && result.matching_skills.length > 0) {
          result.matching_skills.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-success skill-badge';
            badge.textContent = skill;
            matchingSkillsList.appendChild(badge);
          });
        } else {
          matchingSkillsList.innerHTML = '<p class="text-muted">No matching skills found</p>';
        }
      }
      
      // Display missing skills
      const missingSkillsList = document.getElementById('missing-skills');
      if (missingSkillsList) {
        missingSkillsList.innerHTML = '';
        if (result.missing_skills && result.missing_skills.length > 0) {
          result.missing_skills.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger skill-badge';
            badge.textContent = skill;
            missingSkillsList.appendChild(badge);
          });
        } else {
          missingSkillsList.innerHTML = '<p class="text-muted">No missing skills identified</p>';
        }
      }
      
      // Display experience & education summaries
      const experienceSummary = document.getElementById('experience-summary');
      if (experienceSummary) {
        experienceSummary.textContent = result.experience_summary || 'No experience information available';
      }
      
      const educationSummary = document.getElementById('education-summary');
      if (educationSummary) {
        educationSummary.textContent = result.education_summary || 'No education information available';
      }
      
      // Display strengths
      const strengthsList = document.getElementById('strengths-list');
      if (strengthsList) {
        strengthsList.innerHTML = '';
        if (result.strengths && result.strengths.length > 0) {
          result.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = strength;
            strengthsList.appendChild(li);
          });
        } else {
          strengthsList.innerHTML = '<li class="list-group-item text-muted">No specific strengths identified</li>';
        }
      }
      
      // Display weaknesses
      const weaknessesList = document.getElementById('weaknesses-list');
      if (weaknessesList) {
        weaknessesList.innerHTML = '';
        if (result.weaknesses && result.weaknesses.length > 0) {
          result.weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = weakness;
            weaknessesList.appendChild(li);
          });
        } else {
          weaknessesList.innerHTML = '<li class="list-group-item text-muted">No specific weaknesses identified</li>';
        }
      }
      
      // Display overall assessment
      const overallAssessment = document.getElementById('overall-assessment');
      if (overallAssessment) {
        overallAssessment.textContent = result.overall_assessment || 'No overall assessment available';
      }
      
      // Scroll to results
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Update match score gauge
  function updateMatchScoreGauge(score) {
    const canvas = document.getElementById('match-score-gauge');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Determine color based on score
    let color;
    if (score >= 70) {
      color = '#28a745'; // Green for high scores
    } else if (score >= 40) {
      color = '#ffc107'; // Yellow for medium scores
    } else {
      color = '#dc3545'; // Red for low scores
    }
    
    // Draw score arc
    const startAngle = -0.5 * Math.PI; // Start at top
    const endAngle = startAngle + (2 * Math.PI * score / 100);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 15;
    ctx.strokeStyle = color;
    ctx.stroke();
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
