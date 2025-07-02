import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBotService } from 'src/app/services/chat-bot.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit {
  isChatOpen: boolean = false;
  messages: any[] = [];
  newMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  currentLang: string = '';

  constructor(
    private chatBotService: ChatBotService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();
    this.loadChatHistory(); 
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.loadChatHistory();
    }
  }

  loadChatHistory(): void {
    this.chatBotService.getChatHistory().subscribe({
      next: (response) => {
        console.log('Chat History Response:', response);
        if (response && Array.isArray(response)) {
          this.messages = response.map((chat: any) => ({
            id: chat.id,
            sender: chat.sender.toLowerCase(),
            text: chat.messageText,
            timestamp: chat.timestamp
          }));
          console.log('Mapped Messages:', this.messages);
        } else {
          this.errorMessage = 'No chat history available.';
          console.log(this.errorMessage);
        }
      },
      error: (err) => {
        this.errorMessage = 'Error loading chat history. Please try again later.';
        console.error('Error loading chat history:', err);
      }
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: this.newMessage,
      timestamp: new Date().toISOString()
    };
    this.messages.push(userMessage);

    this.isLoading = true;

    this.chatBotService.sendMessage(this.newMessage).subscribe({
      next: (response) => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.response,
          timestamp: new Date().toISOString()
        };
        this.messages.push(botMessage);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'حدث خطأ أثناء الرد. حاول مرة أخرى.',
          timestamp: new Date().toISOString()
        };
        this.messages.push(errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    this.newMessage = '';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}