// UI Module - Main controller for the Stepper side panel
import { findBestMatch } from './kb-loader.js';
import { StepManager } from './stepper.js';

// Initialize step manager
const stepManager = new StepManager();

// Initialize theme
async function initTheme() {
  // Check if chrome API is available (extension context)
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const result = await chrome.storage.local.get(['watercolorTheme']);
      if (result.watercolorTheme) {
        document.body.classList.add('watercolor-theme');
      }
      
      // Listen for theme changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.watercolorTheme) {
          if (changes.watercolorTheme.newValue) {
            document.body.classList.add('watercolor-theme');
            updateProgressDisplay();
          } else {
            document.body.classList.remove('watercolor-theme');
            updateProgressDisplay();
          }
        }
      });
    } catch (error) {
      console.warn('Chrome storage not available for theme persistence');
    }
  } else {
    // For testing outside extension context, check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('theme') === 'watercolor') {
      document.body.classList.add('watercolor-theme');
    }
  }
}

// Initialize theme on load
initTheme();

// Get DOM elements
const searchSection = document.getElementById('searchSection');
const noResultsSection = document.getElementById('noResultsSection');
const solutionSection = document.getElementById('solutionSection');
const stepSection = document.getElementById('stepSection');
const fullArticleSection = document.getElementById('fullArticleSection');
const feedbackSection = document.getElementById('feedbackSection');
const feedbackSuccessSection = document.getElementById('feedbackSuccessSection');

const issueInput = document.getElementById('issueInput');
const searchBtn = document.getElementById('searchBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const startBtn = document.getElementById('startBtn');
const backToSearchBtn = document.getElementById('backToSearchBtn');
const continueBtn = document.getElementById('continueBtn');
const backBtn = document.getElementById('backBtn');
const didntWorkBtn = document.getElementById('didntWorkBtn');
const fullArticleBtn = document.getElementById('fullArticleBtn');
const resetBtn = document.getElementById('resetBtn');
const backToStepsBtn = document.getElementById('backToStepsBtn');
const closeArticleBtn = document.getElementById('closeArticleBtn');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
const continueFeedbackBtn = document.getElementById('continueFeedbackBtn');
const newSearchBtn = document.getElementById('newSearchBtn');

// Section visibility management
function showSection(section) {
  hideAllSections();
  section.classList.remove('hidden');
}

function hideAllSections() {
  searchSection.classList.add('hidden');
  noResultsSection.classList.add('hidden');
  solutionSection.classList.add('hidden');
  stepSection.classList.add('hidden');
  fullArticleSection.classList.add('hidden');
  feedbackSection.classList.add('hidden');
  feedbackSuccessSection.classList.add('hidden');
}

// Search for solution
async function searchForSolution() {
  const query = issueInput.value.trim();
  
  if (!query) {
    alert('Please enter a description of your issue before searching');
    return;
  }

  const article = await findBestMatch(query);
  
  if (article) {
    stepManager.setArticle(article);
    displaySolutionOverview();
  } else {
    showSection(noResultsSection);
  }
}

// Display solution overview
function displaySolutionOverview() {
  const stepInfo = stepManager.getCurrentStep();
  
  document.getElementById('solutionTitle').textContent = stepInfo.articleTitle;
  document.getElementById('solutionSummary').textContent = stepInfo.articleSummary;
  document.getElementById('stepCount').textContent = `This solution has ${stepInfo.totalSteps} steps`;
  
  showSection(solutionSection);
}

// Display current step
function displayCurrentStep() {
  const stepInfo = stepManager.getCurrentStep();
  
  if (!stepInfo) {
    return;
  }

  // Update step display
  document.getElementById('stepNumber').textContent = `Step ${stepInfo.stepNumber} of ${stepInfo.totalSteps}`;
  document.getElementById('stepTitle').textContent = stepInfo.articleTitle;
  document.getElementById('stepText').textContent = stepInfo.stepText;
  
  // Update progress bar
  updateProgressDisplay();
  
  // Update button states
  backBtn.disabled = stepInfo.isFirst;
  
  if (stepInfo.isLast) {
    continueBtn.textContent = '✓ Complete';
  } else {
    continueBtn.textContent = 'Continue →';
  }
  
  showSection(stepSection);
}

// Update progress display (bar or stepping stones based on theme)
function updateProgressDisplay() {
  const stepInfo = stepManager.getCurrentStep();
  if (!stepInfo) return;
  
  const progress = (stepInfo.stepNumber / stepInfo.totalSteps) * 100;
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.getElementById('progressFill');
  
  if (document.body.classList.contains('watercolor-theme')) {
    // Create stepping stones animation
    createSteppingStones(progressBar, stepInfo.stepNumber, stepInfo.totalSteps);
  } else {
    // Use traditional progress bar
    progressFill.style.width = `${progress}%`;
    // Clear any stepping stones
    const existingStones = progressBar.querySelectorAll('.stepping-stone, .cartoon-boy');
    existingStones.forEach(stone => stone.remove());
  }
}

// Create stepping stones with cartoon boy
function createSteppingStones(container, currentStep, totalSteps) {
  // Clear existing stones and boy
  const existingStones = container.querySelectorAll('.stepping-stone, .cartoon-boy');
  existingStones.forEach(stone => stone.remove());
  
  // Create stones
  const stones = [];
  for (let i = 0; i < totalSteps; i++) {
    const stone = document.createElement('div');
    stone.className = 'stepping-stone';
    
    if (i < currentStep - 1) {
      stone.classList.add('completed');
    } else if (i === currentStep - 1) {
      stone.classList.add('active');
    }
    
    container.appendChild(stone);
    stones.push(stone);
  }
  
  // Create cartoon boy
  const boy = document.createElement('div');
  boy.className = 'cartoon-boy';
  boy.innerHTML = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Simple cartoon boy in gentle storybook style -->
      <!-- Head -->
      <circle cx="50" cy="35" r="18" fill="#f4c89f" stroke="#5a5a5a" stroke-width="2"/>
      <!-- Hair -->
      <path d="M 35 30 Q 35 20 45 22 Q 50 18 55 22 Q 65 20 65 30" 
            fill="#8b6f47" stroke="#5a5a5a" stroke-width="1.5"/>
      <!-- Eyes -->
      <circle cx="43" cy="33" r="2.5" fill="#5a5a5a"/>
      <circle cx="57" cy="33" r="2.5" fill="#5a5a5a"/>
      <!-- Smile -->
      <path d="M 42 42 Q 50 46 58 42" fill="none" stroke="#5a5a5a" 
            stroke-width="2" stroke-linecap="round"/>
      <!-- Body -->
      <ellipse cx="50" cy="65" rx="15" ry="20" fill="#a5c9e5" 
               stroke="#5a5a5a" stroke-width="2"/>
      <!-- Arms -->
      <path d="M 35 58 Q 30 65 32 72" fill="none" stroke="#f4c89f" 
            stroke-width="5" stroke-linecap="round"/>
      <path d="M 65 58 Q 70 65 68 72" fill="none" stroke="#f4c89f" 
            stroke-width="5" stroke-linecap="round"/>
      <!-- Legs -->
      <path d="M 43 82 L 40 95" fill="none" stroke="#7a9aaa" 
            stroke-width="6" stroke-linecap="round"/>
      <path d="M 57 82 L 60 95" fill="none" stroke="#7a9aaa" 
            stroke-width="6" stroke-linecap="round"/>
      <!-- Shoes -->
      <ellipse cx="40" cy="96" rx="5" ry="3" fill="#5a5a5a"/>
      <ellipse cx="60" cy="96" rx="5" ry="3" fill="#5a5a5a"/>
    </svg>
  `;
  
  container.appendChild(boy);
  
  // Position boy on current stone (currentStep is 1-based, stones array is 0-based)
  if (stones[currentStep - 1]) {
    positionBoyOnStone(boy, stones[currentStep - 1], container);
  }
}

// Position cartoon boy on a stepping stone
function positionBoyOnStone(boy, stone, container) {
  const containerRect = container.getBoundingClientRect();
  const stoneRect = stone.getBoundingClientRect();
  const boyLeft = ((stoneRect.left - containerRect.left + stoneRect.width / 2) / containerRect.width) * 100;
  
  boy.style.left = `${boyLeft}%`;
  
  // Add jumping animation
  boy.classList.remove('jumping');
  // Trigger reflow to restart CSS animation (return value intentionally unused)
  boy.getBoundingClientRect();
  boy.classList.add('jumping');
}

// Handle continue button
function handleContinue() {
  const stepInfo = stepManager.getCurrentStep();
  
  if (stepInfo.isLast) {
    // On last step, show completion message
    showCompletionMessage();
  } else {
    stepManager.nextStep();
    displayCurrentStep();
  }
}

// Handle back button
function handleBack() {
  stepManager.previousStep();
  displayCurrentStep();
}

// Handle reset button
function handleReset() {
  if (confirm('Are you sure you want to restart from step 1?')) {
    stepManager.reset();
    displayCurrentStep();
  }
}

// Show completion message
function showCompletionMessage() {
  if (confirm('Great! Did this solve your issue?')) {
    alert('Wonderful! We\'re glad we could help.');
    resetToSearch();
  } else {
    if (confirm('We\'re sorry to hear that. Would you like to provide feedback?')) {
      showSection(feedbackSection);
    } else {
      resetToSearch();
    }
  }
}

// Display full article
function displayFullArticle() {
  const article = stepManager.getArticle();
  
  if (!article) {
    return;
  }

  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleSummary').textContent = article.summary;
  
  const stepsList = document.getElementById('articleSteps');
  stepsList.innerHTML = '';
  
  article.steps.forEach((step, index) => {
    const li = document.createElement('li');
    li.textContent = step;
    stepsList.appendChild(li);
  });
  
  showSection(fullArticleSection);
}

// Handle "This didn't work" feedback
function handleDidntWork() {
  showSection(feedbackSection);
  document.getElementById('feedbackText').value = '';
}

// Submit feedback
function submitFeedback() {
  const feedback = document.getElementById('feedbackText').value.trim();
  
  if (!feedback) {
    alert('Please describe what went wrong before submitting feedback');
    return;
  }

  // TODO: Replace with backend API call when implementing server integration
  console.log('Feedback submitted:', {
    article: stepManager.getArticle().title,
    step: stepManager.getCurrentStep().stepNumber,
    feedback: feedback
  });
  
  showSection(feedbackSuccessSection);
}

// Reset to search
function resetToSearch() {
  stepManager.clear();
  issueInput.value = '';
  showSection(searchSection);
  issueInput.focus();
}

// Event listeners
searchBtn.addEventListener('click', searchForSolution);
issueInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    searchForSolution();
  }
});

tryAgainBtn.addEventListener('click', resetToSearch);
startBtn.addEventListener('click', displayCurrentStep);
backToSearchBtn.addEventListener('click', resetToSearch);

continueBtn.addEventListener('click', handleContinue);
backBtn.addEventListener('click', handleBack);
resetBtn.addEventListener('click', handleReset);

didntWorkBtn.addEventListener('click', handleDidntWork);
fullArticleBtn.addEventListener('click', displayFullArticle);

backToStepsBtn.addEventListener('click', displayCurrentStep);
closeArticleBtn.addEventListener('click', resetToSearch);

submitFeedbackBtn.addEventListener('click', submitFeedback);
cancelFeedbackBtn.addEventListener('click', displayCurrentStep);
continueFeedbackBtn.addEventListener('click', displayCurrentStep);
newSearchBtn.addEventListener('click', resetToSearch);

// Focus on input when page loads
issueInput.focus();
