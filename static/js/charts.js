// Initialize sentiment chart
let sentimentChart = null;

function initializeSentimentChart(result) {
  const ctx = document.getElementById('sentiment-chart');
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (sentimentChart) {
    sentimentChart.destroy();
  }
  
  // Extract data from the result
  const positiveAspects = result.positive_aspects || [];
  const concerns = result.concerns || [];
  
  // Create datasets for the chart
  const labels = ['Positive Aspects', 'Concerns'];
  const data = [positiveAspects.length, concerns.length];
  
  // Create the chart
  sentimentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Count',
        data: data,
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',   // Green for positive
          'rgba(220, 53, 69, 0.7)'    // Red for concerns
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              let items = [];
              
              if (index === 0 && positiveAspects.length > 0) {
                items = positiveAspects;
              } else if (index === 1 && concerns.length > 0) {
                items = concerns;
              }
              
              return items.map(item => '• ' + item);
            }
          }
        }
      }
    }
  });
}

// Initialize attrition risk gauge
function initializeAttritionGauge(level = 'low') {
  const ctx = document.getElementById('attrition-gauge');
  if (!ctx) return;
  
  // Map risk level to a value between 0 and 100
  let value;
  switch(level.toLowerCase()) {
    case 'high':
      value = 80;
      break;
    case 'medium':
      value = 50;
      break;
    case 'low':
      value = 20;
      break;
    default:
      value = 0;
  }
  
  // Create the gauge chart
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, 100 - value],
        backgroundColor: [
          getColorForValue(value),
          'rgba(200, 200, 200, 0.2)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      circumference: 180,
      rotation: 270,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      layout: {
        padding: {
          bottom: 20
        }
      }
    }
  });
  
  // Add text in the center
  const centerText = level.charAt(0).toUpperCase() + level.slice(1);
  addCenterText(ctx, centerText, getColorForValue(value));
}

// Helper function to get color based on value
function getColorForValue(value) {
  if (value >= 70) {
    return 'rgba(220, 53, 69, 0.8)'; // Red for high risk
  } else if (value >= 30) {
    return 'rgba(255, 193, 7, 0.8)'; // Yellow for medium risk
  } else {
    return 'rgba(40, 167, 69, 0.8)'; // Green for low risk
  }
}

// Helper function to add text to the center of a doughnut chart
function addCenterText(ctx, text, color) {
  const chart = Chart.getChart(ctx);
  
  // Add event listener to render text after chart is updated
  chart.options.plugins.centerText = {
    text: text,
    color: color
  };
  
  // Add a custom plugin to render the center text
  if (!chart.centerTextPlugin) {
    chart.centerTextPlugin = {
      id: 'centerText',
      afterDraw: function(chart) {
        if (chart.options.plugins.centerText) {
          const { ctx, chartArea } = chart;
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = chart.options.plugins.centerText.color;
          ctx.fillText(chart.options.plugins.centerText.text, centerX, centerY);
          ctx.restore();
        }
      }
    };
    
    Chart.register(chart.centerTextPlugin);
  }
  
  chart.update();
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize attrition gauge if the element exists
  const attritionRiskEl = document.getElementById('attrition-risk');
  if (attritionRiskEl) {
    const riskLevel = attritionRiskEl.textContent.toLowerCase();
    initializeAttritionGauge(riskLevel);
  }
});
