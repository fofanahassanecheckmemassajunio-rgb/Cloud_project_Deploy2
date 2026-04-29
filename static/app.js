// ============================================
// SPAM GUARDIAN - FRONTEND LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ Spam Guardian Initialized');
    
    // DOM Elements
    const form = document.getElementById('predict-form');
    const input = document.getElementById('message-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const charCounter = document.getElementById('char-count');
    
    // Result elements
    const resultLabel = document.getElementById('result-label');
    const resultDescription = document.getElementById('result-description');
    const resultIcon = document.getElementById('result-icon');
    const confidencePercentage = document.getElementById('confidence-percentage');
    const confidenceFill = document.getElementById('confidence-fill');
    
    // Stats elements
    const hamLenStat = document.getElementById('stat-ham-len');
    const spamLenStat = document.getElementById('stat-spam-len');
    const accuracyStat = document.getElementById('accuracy-stat');
    const totalMessagesStat = document.getElementById('total-messages-stat');
    
    // Chart Instance
    let distributionChart = null;
    let isLoading = false;

    // ============================================
    // INITIALIZATION
    // ============================================
    
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Check if all DOM elements exist
    checkDOMElements();
    
    // Fetch stats on load
    setTimeout(fetchStats, 500);
    
    // Character counter
    if (input) {
        input.addEventListener('input', () => {
            charCounter.textContent = input.value.length;
        });
    }

    // ============================================
    // CHECK DOM ELEMENTS
    // ============================================
    
    function checkDOMElements() {
        const elements = {
            form, input, submitBtn, resultContainer, charCounter,
            resultLabel, resultDescription, resultIcon,
            confidencePercentage, confidenceFill,
            hamLenStat, spamLenStat, accuracyStat, totalMessagesStat
        };
        
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.warn(`⚠️ Missing DOM element: ${key}`);
            }
        }
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = input.value.trim();
            
            // Validation
            if (!message) {
                showError('Please enter a message to analyze');
                return;
            }
            
            if (message.length < 5) {
                showError('Message must be at least 5 characters long');
                return;
            }
            
            // Submit for analysis
            await analyzMessage(message);
        });
    }

    // ============================================
    // ANALYZE MESSAGE
    // ============================================
    
    async function analyzMessage(message) {
        if (isLoading) return;
        
        isLoading = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="btn-icon spin"></i> <span class="btn-text">Analyzing...</span>`;
        
        if (window.lucide) {
            lucide.createIcons();
        }
        resultContainer.classList.add('hidden');

        try {
            console.log('📤 Sending request to /predict...');
            
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            console.log(`📥 Response status: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(errorData.error || `HTTP ${response.status}: Analysis failed`);
            }

            const data = await response.json();
            console.log('✅ Analysis result:', data);
            
            if (data.prediction && data.confidence !== undefined) {
                displayResult(data.prediction, data.confidence);
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            showError(error.message || 'Failed to analyze message. Please try again. Check browser console for details.');
        } finally {
            isLoading = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span class="btn-text">Scan Message</span> <i data-lucide="send" class="btn-icon"></i>`;
            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }

    // ============================================
    // DISPLAY RESULT
    // ============================================
    
    function displayResult(prediction, confidence) {
        console.log(`🎯 Displaying result: ${prediction} (${confidence}%)`);
        
        resultContainer.classList.remove('hidden', 'safe-result', 'spam-result');
        
        const isSafe = prediction === 'HAM';
        const resultClass = isSafe ? 'safe-result' : 'spam-result';
        resultContainer.classList.add(resultClass);
        
        // Update result info
        if (isSafe) {
            resultIcon.setAttribute('data-lucide', 'check-circle');
            resultLabel.textContent = '✓ Safe Message';
            resultDescription.textContent = 'This message appears to be legitimate and secure. No spam indicators detected.';
        } else {
            resultIcon.setAttribute('data-lucide', 'alert-triangle');
            resultLabel.textContent = '⚠️ Spam Detected';
            resultDescription.textContent = 'This message has been flagged as potential spam. Exercise caution with links or requests.';
        }
        
        // Update confidence
        confidencePercentage.textContent = `${confidence}%`;
        confidenceFill.style.width = `${confidence}%`;
        
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Scroll to result
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // ============================================
    // ERROR HANDLING
    // ============================================
    
    function showError(message) {
        console.error('🚨 Showing error:', message);
        resultContainer.classList.remove('hidden', 'safe-result', 'spam-result');
        resultContainer.classList.add('spam-result');
        
        resultIcon.setAttribute('data-lucide', 'alert-circle');
        resultLabel.textContent = '❌ Error';
        resultDescription.textContent = message;
        
        confidencePercentage.textContent = '0%';
        confidenceFill.style.width = '0%';
        
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Scroll to result
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // ============================================
    // FETCH STATISTICS
    // ============================================
    
    async function fetchStats() {
        try {
            console.log('📊 Fetching statistics...');
            
            const response = await fetch('/stats');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch statistics`);
            }
            
            const data = await response.json();
            console.log('✅ Statistics loaded:', data);
            
            // Update text stats
            if (hamLenStat && data.avg_length) {
                hamLenStat.textContent = `${data.avg_length.Ham} chars`;
            }
            if (spamLenStat && data.avg_length) {
                spamLenStat.textContent = `${data.avg_length.Spam} chars`;
            }
            
            // Calculate totals
            const totalHam = data.distribution?.Ham || 0;
            const totalSpam = data.distribution?.Spam || 0;
            const totalMessages = totalHam + totalSpam;
            
            if (totalMessagesStat) {
                totalMessagesStat.textContent = totalMessages.toLocaleString();
            }
            
            // Display accuracy from model metrics
            if (accuracyStat && data.accuracy !== undefined) {
                accuracyStat.textContent = `${data.accuracy}%`;
            }
            
            // Render chart
            renderChart(totalHam, totalSpam);
            
        } catch (error) {
            console.error('❌ Failed to fetch statistics:', error);
            if (hamLenStat) hamLenStat.textContent = 'Error';
            if (spamLenStat) spamLenStat.textContent = 'Error';
        }
    }

    // ============================================
    // RENDER CHART
    // ============================================
    
    function renderChart(hamCount, spamCount) {
        try {
            const ctx = document.getElementById('distributionChart');
            
            if (!ctx) {
                console.error('❌ Chart canvas not found');
                return;
            }
            
            console.log(`📈 Rendering chart: Ham=${hamCount}, Spam=${spamCount}`);
            
            // Destroy existing chart
            if (distributionChart) {
                distributionChart.destroy();
            }

            // Configure chart defaults
            if (window.Chart) {
                Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
                Chart.defaults.color = '#a0aec0';

                // Create new chart
                distributionChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Safe (Ham)', 'Spam'],
                        datasets: [{
                            data: [hamCount, spamCount],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',   // Success green
                                'rgba(239, 68, 68, 0.8)'      // Danger red
                            ],
                            borderColor: [
                                'rgba(16, 185, 129, 1)',
                                'rgba(239, 68, 68, 1)'
                            ],
                            borderWidth: 2,
                            hoverOffset: 8,
                            animation: {
                                animateScale: true,
                                animateRotate: true
                            }
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    font: {
                                        size: 14,
                                        weight: '500'
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '65%'
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error rendering chart:', error);
        }
    }

    // ============================================
    // UTILITY: Format Numbers
    // ============================================
    
    window.formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };
});

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});
