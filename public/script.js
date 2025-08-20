// Counter to assign unique IDs to bot messages
let messageCount = 0;
let selectedFile = null; // Variable to store the selected file

// Utility function to scroll the chat container to the bottom
function scrollToBottom() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to append a message to the chat container
function appendMessage(sender, message, id = null) {
    const messageHtml = `
      <div class="message ${sender}">
        <div class="msg-header">${capitalizeFirstLetter(sender)}</div>
        <div class="msg-body" ${id ? `id="${id}"` : ""}>${message}</div>
      </div>
    `;
    document.getElementById("chatContainer").insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to handle sending a user message
function sendMessage() {
    const inputField = document.getElementById("text");
    const rawText = inputField.value;

    if (!rawText && !selectedFile) return; // Do nothing if input and file are empty

    appendMessage("user", rawText || "File Sent"); // Add user message or file notification
    inputField.value = ""; // Clear the input field

    const formData = new FormData();
    formData.append("msg", rawText);
    if (selectedFile) {
        formData.append("file", selectedFile);
    }

    fetchBotResponse(formData); // Fetch response from the server
}

// Function to fetch the bot's response from the server
function fetchBotResponse(formData) {
    fetch("/get", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.text())
        .then((data) => displayBotResponse(data))
        .catch(() => displayError())
        .finally(() => {
            selectedFile = null; // Reset the selected file after sending
        });
}

// Function to display the bot's response with a gradual reveal effect
function displayBotResponse(data) {
    const botMessageId = `botMessage-${messageCount++}`; // Increment messageCount properly
    appendMessage("model", "", botMessageId); // Add placeholder for bot message

    const botMessageDiv = document.getElementById(botMessageId);
    botMessageDiv.textContent = ""; // Ensure it's empty

    let index = 0;
    const interval = setInterval(() => {
        if (index < data.length) {
            botMessageDiv.textContent += data[index++]; // Gradually add characters
        } else {
            clearInterval(interval); // Stop once the response is fully revealed
        }
    }, 30);
}

// Function to display an error message in the chat
function displayError() {
    appendMessage("model error", "Failed to fetch a response from the server.");
}

// Attach event listeners for the send button and the Enter key
function attachEventListeners() {
    const sendButton = document.getElementById("send");
    const inputField = document.getElementById("text");
    const attachmentButton = document.getElementById("attachment");
    const fileInput = document.getElementById("fileInput");

    sendButton.addEventListener("click", sendMessage);

    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Trigger file input on attachment button click
    attachmentButton.addEventListener("click", () => {
        fileInput.click();
    });

    // Store selected file
    fileInput.addEventListener("change", (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            appendMessage("user", `Selected File: ${selectedFile.name}`);
        }
    });
}

// ===========================================
// GESTION DU THÈME JOUR/NUIT
// ===========================================

// Gestion du thème jour/nuit
class ThemeManager {
    constructor() {
        // Essayer de récupérer le thème depuis localStorage, sinon utiliser 'dark' par défaut
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        // Appliquer le thème sauvegardé
        this.applyTheme(this.currentTheme);
        
        // Ajouter l'écouteur d'événement au bouton
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('chatbot-theme');
        } catch (e) {
            // En cas d'erreur avec localStorage, retourner null
            console.warn('Unable to access localStorage:', e);
            return null;
        }
    }

    setStoredTheme(theme) {
        try {
            localStorage.setItem('chatbot-theme', theme);
        } catch (e) {
            // En cas d'erreur avec localStorage, continuer sans sauvegarder
            console.warn('Unable to save theme to localStorage:', e);
        }
    }

    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
        } else {
            body.removeAttribute('data-theme');
            theme = 'dark'; // S'assurer que le thème est bien 'dark'
        }
        
        this.currentTheme = theme;
        
        // Sauvegarder le thème
        this.setStoredTheme(theme);
        
        // Animation de transition douce
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Effet visuel sur le bouton
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.style.transform = 'translateY(-50%) scale(0.9)';
            themeToggle.style.transition = 'transform 0.15s ease';
            
            setTimeout(() => {
                themeToggle.style.transform = 'translateY(-50%) scale(1)';
                setTimeout(() => {
                    themeToggle.style.transition = '';
                }, 150);
            }, 150);
        }
        
        // Optionnel: ajouter une animation de confirmation
        this.showThemeChangeNotification(newTheme);
    }

    showThemeChangeNotification(theme) {
        // Créer une petite notification temporaire
        const notification = document.createElement('div');
        notification.innerHTML = theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--model-msg-bg);
            color: var(--model-msg-text);
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            border: 1px solid var(--model-msg-border);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Animation de disparition
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    // Méthode pour forcer un thème spécifique
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
        }
    }
}

// Variable globale pour le gestionnaire de thème
let themeManager;

// Fonction utilitaire pour changer le thème depuis l'extérieur
function setTheme(theme) {
    if (themeManager) {
        themeManager.setTheme(theme);
    }
}

// Fonction pour obtenir le thème actuel
function getCurrentTheme() {
    return themeManager ? themeManager.getCurrentTheme() : 'dark';
}

// Fonction pour basculer le thème
function toggleTheme() {
    if (themeManager) {
        themeManager.toggleTheme();
    }
}

// ===========================================
// INITIALISATION DE L'APPLICATION
// ===========================================

// Initialize the chat application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Initialiser les écouteurs d'événements du chat
    attachEventListeners();
    
    // Initialiser le gestionnaire de thème
    themeManager = new ThemeManager();
    
    // Message de bienvenue optionnel
    setTimeout(() => {
        appendMessage("model", "👋 Hello! I'm your AI assistant. How can I help you today?");
    }, 500);
});

// ===========================================
// FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
// ===========================================

// Fonction pour effacer la conversation
function clearChat() {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
        chatContainer.innerHTML = "";
        messageCount = 0;
    }
}

// Fonction pour sauvegarder la conversation
function saveChat() {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
        const chatContent = chatContainer.innerHTML;
        const blob = new Blob([chatContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K pour effacer le chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (confirm('Are you sure you want to clear the conversation?')) {
            clearChat();
        }
    }
    
    // Ctrl/Cmd + D pour basculer le thème
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
    }
});

// Gestionnaire d'erreurs global
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.error);
});

// Optimisation des performances - débounce pour le scroll
let scrollTimeout;
function optimizedScrollToBottom() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(scrollToBottom, 10);
}