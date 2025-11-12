<!-- ChatInterface.vue -->
<template>
  <div class="chat-container">
    <!-- 查看历史记录按钮 -->
    <div class="history-button-container">
      <button class="history-button" @click="$router.push('/profile')">个人中心</button>
      <button class="history-button" @click="showHistoryModal = true">
        查看咨询记录
      </button>
      <button class="history-button" @click="$router.push('/points')">积分商城</button>
    </div>
    
    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message', message.sender]"
      >
        <div class="message-content">{{ message.content }}</div>
        <div class="timestamp">{{ message.timestamp }}</div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area" v-if="!isConversationEnded">
      <div class="input-wrapper">
        <textarea 
          ref="messageInput"
          class="input"
          v-model="userInput"
          :placeholder="currentQuestion.placeholder"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="addNewLine"
          @input="adjustTextareaHeight"
        ></textarea>
        <div class="input-hint">Shift + Enter 换行</div>
      </div>
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userInput.trim()"
      >
        发送
      </button>
    </div>
    
    <!-- 结束对话提示 -->
    <div class="end-conversation" v-else>
      <div class="end-message">
        感谢您使用购车咨询服务，祝您购车愉快！
      </div>
      <button class="restart-button" @click="restartConversation">
        重新开始咨询
      </button>
    </div>
    
    <!-- 历史记录模态框 -->
    <div class="modal-overlay" v-if="showHistoryModal" @click="showHistoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>咨询记录</h3>
          <button class="close-button" @click="showHistoryModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="history-list">
            <div 
              v-for="(record, index) in consultationHistory" 
              :key="index"
              class="history-item"
              @click="selectHistoryRecord(record)"
            >
              <div class="history-title">
                咨询记录 #{{ index + 1 }}
              </div>
              <div class="history-summary">
                {{ getHistorySummary(record) }}
              </div>
              <div class="history-date">
                {{ record.date }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-close-button" @click="showHistoryModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>
    
    <!-- 详细记录模态框 -->
    <div class="modal-overlay" v-if="showDetailModal" @click="showDetailModal = false">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>详细咨询记录</h3>
          <button class="close-button" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-content" v-if="selectedRecord">
            <div class="detail-section">
              <h4>用户需求</h4>
              <div class="requirement-item">
                <span class="label">预算范围:</span>
                <span>{{ selectedRecord.requirements.budget_range || '未提供' }}</span>
              </div>
              <div class="requirement-item">
                <span class="label">品牌偏好:</span>
                <span>{{ selectedRecord.requirements.brand_preference || '未提供' }}</span>
              </div>
              <div class="requirement-item">
                <span class="label">燃料类型:</span>
                <span>{{ selectedRecord.requirements.fuel_type || '未提供' }}</span>
              </div>
              <div class="requirement-item">
                <span class="label">偏好车型:</span>
                <span>{{ selectedRecord.requirements.preferred_type || '未提供' }}</span>
              </div>
              <div class="requirement-item">
                <span class="label">使用场景:</span>
                <span>{{ selectedRecord.requirements.use_case || '未提供' }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>推荐结果</h4>
              <div class="recommendation-content">
                {{ selectedRecord.recommendation }}
              </div>
            </div>
            
            <div class="detail-section">
              <h4>对话详情</h4>
              <div class="conversation-detail">
                <div 
                  v-for="(msg, idx) in selectedRecord.conversation"
                  :key="idx"
                  :class="['message', msg.sender]"
                >
                  <div class="message-content">{{ msg.content }}</div>
                  <div class="timestamp">{{ msg.timestamp }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-close-button" @click="showDetailModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { earnPoints } from '@/services/points'
export default {
  name: 'ChatInterface',
  data() {
    return {
      messages: [],
      userInput: '',
      // 存储用户购车需求的数据对象
      carRequirements: {
        brand_preference: '',   // 品牌偏好
        budget_range: '',       // 预算范围
        fuel_type: '',          // 燃料材料偏好
        preferred_type: '',     // 偏好车型
        use_case: ''            // 主要使用场景
      },
      // 当前询问的问题索引
      currentQuestionIndex: 0,
      // 对话是否已结束
      isConversationEnded: false,
      // 定义问题序列
      questions: [
        {
          key: 'budget_range',
          text: '请问您的购车预算范围是多少？（例如：10-15万、20万以上等）',
          placeholder: '请输入您的预算范围...'
        },
        {
          key: 'brand_preference',
          text: '您有特别偏好的汽车品牌吗？（例如：丰田、本田、奔驰等）',
          placeholder: '请输入您偏好的品牌...'
        },
        {
          key: 'fuel_type',
          text: '您倾向于哪种燃料类型的车辆？（例如：汽油、柴油、纯电动、混动等）',
          placeholder: '请输入您偏好的燃料类型...'
        },
        {
          key: 'preferred_type',
          text: '您更喜欢哪种类型的车型？（例如：轿车、SUV、MPV、跑车等）',
          placeholder: '请输入您偏好的车型...'
        },
        {
          key: 'use_case',
          text: '您的主要使用场景是什么？（例如：日常通勤、家庭出行、商务用车等）',
          placeholder: '请输入您的主要使用场景...'
        }
      ],
      // 历史记录相关
      showHistoryModal: false,
      showDetailModal: false,
      selectedRecord: null,
      consultationHistory: [
        // 示例数据，实际应从后端获取
        {
          id: 1,
          date: '2023-05-15 14:30',
          requirements: {
            budget_range: '15-20万',
            brand_preference: '丰田',
            fuel_type: '汽油',
            preferred_type: 'SUV',
            use_case: '家庭出行'
          },
          recommendation: '根据您的需求，我们为您推荐以下车型：\n1. 丰田RAV4荣放 - 空间宽敞，适合家庭使用\n2. 本田CR-V - 燃油经济性好，可靠性高\n3. 大众途岳 - 德系品质，操控性能优秀',
          conversation: [
            { sender: 'system', content: '您好！欢迎使用购车咨询服务。为了更好地为您推荐合适的车型，我需要了解一些您的购车需求。', timestamp: '14:30' },
            { sender: 'system', content: '请问您的购车预算范围是多少？（例如：10-15万、20万以上等）', timestamp: '14:30' },
            { sender: 'user', content: '15-20万', timestamp: '14:31' },
            { sender: 'system', content: '您有特别偏好的汽车品牌吗？（例如：丰田、本田、奔驰等）', timestamp: '14:31' },
            { sender: 'user', content: '丰田', timestamp: '14:32' },
            { sender: 'system', content: '您倾向于哪种燃料类型的车辆？（例如：汽油、柴油、纯电动、混动等）', timestamp: '14:32' },
            { sender: 'user', content: '汽油', timestamp: '14:32' },
            { sender: 'system', content: '您更喜欢哪种类型的车型？（例如：轿车、SUV、MPV、跑车等）', timestamp: '14:33' },
            { sender: 'user', content: 'SUV', timestamp: '14:33' },
            { sender: 'system', content: '您的主要使用场景是什么？（例如：日常通勤、家庭出行、商务用车等）', timestamp: '14:33' },
            { sender: 'user', content: '家庭出行', timestamp: '14:34' },
            { sender: 'system', content: '感谢您提供的信息，您当前的购车需求如下：\n预算范围：15-20万\n品牌偏好：丰田\n燃料类型：汽油\n偏好车型：SUV\n使用场景：家庭出行\n\n正在为您推荐合适的车型...', timestamp: '14:34' },
            { sender: 'system', content: '根据您的需求，我们为您推荐以下车型：\n1. 丰田RAV4荣放 - 空间宽敞，适合家庭使用\n2. 本田CR-V - 燃油经济性好，可靠性高\n3. 大众途岳 - 德系品质，操控性能优秀', timestamp: '14:35' }
          ]
        },
        {
          id: 2,
          date: '2023-05-10 10:15',
          requirements: {
            budget_range: '20万以上',
            brand_preference: '宝马',
            fuel_type: '纯电动',
            preferred_type: '轿车',
            use_case: '商务用车'
          },
          recommendation: '根据您的需求，我们为您推荐以下车型：\n1. 宝马i3 - 豪华电动轿车，科技感强\n2. 特斯拉Model S - 续航里程长，智能驾驶先进\n3. 奔驰EQS - 豪华舒适，内饰精致',
          conversation: [
            { sender: 'system', content: '您好！欢迎使用购车咨询服务。为了更好地为您推荐合适的车型，我需要了解一些您的购车需求。', timestamp: '10:15' },
            { sender: 'system', content: '请问您的购车预算范围是多少？（例如：10-15万、20万以上等）', timestamp: '10:15' },
            { sender: 'user', content: '20万以上', timestamp: '10:16' },
            { sender: 'system', content: '您有特别偏好的汽车品牌吗？（例如：丰田、本田、奔驰等）', timestamp: '10:16' },
            { sender: 'user', content: '宝马', timestamp: '10:17' },
            { sender: 'system', content: '您倾向于哪种燃料类型的车辆？（例如：汽油、柴油、纯电动、混动等）', timestamp: '10:17' },
            { sender: 'user', content: '纯电动', timestamp: '10:17' },
            { sender: 'system', content: '您更喜欢哪种类型的车型？（例如：轿车、SUV、MPV、跑车等）', timestamp: '10:18' },
            { sender: 'user', content: '轿车', timestamp: '10:18' },
            { sender: 'system', content: '您的主要使用场景是什么？（例如：日常通勤、家庭出行、商务用车等）', timestamp: '10:18' },
            { sender: 'user', content: '商务用车', timestamp: '10:19' },
            { sender: 'system', content: '感谢您提供的信息，您当前的购车需求如下：\n预算范围：20万以上\n品牌偏好：宝马\n燃料类型：纯电动\n偏好车型：轿车\n使用场景：商务用车\n\n正在为您推荐合适的车型...', timestamp: '10:19' },
            { sender: 'system', content: '根据您的需求，我们为您推荐以下车型：\n1. 宝马i3 - 豪华电动轿车，科技感强\n2. 特斯拉Model S - 续航里程长，智能驾驶先进\n3. 奔驰EQS - 豪华舒适，内饰精致', timestamp: '10:20' }
          ]
        }
      ]
    };
  },
  computed: {
    // 计算当前问题
    currentQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        return this.questions[this.currentQuestionIndex];
      }
      return { text: '感谢您提供的信息，正在为您推荐合适的车型...', placeholder: '请输入...' };
    },
    // 检查是否已完成所有问题
    isQuestionnaireComplete() {
      return this.currentQuestionIndex >= this.questions.length;
    }
  },
  methods: {
    // 将时间统一为北京时间（HH:mm）
    getCurrentTime() {
      const fmt = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date());
      return fmt;
    },

    // 新增：调整文本框高度
    adjustTextareaHeight(event) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    },

    // 新增：处理 Shift+Enter 换行
    addNewLine(event) {
      this.userInput += '\n';
      this.$nextTick(() => {
        this.adjustTextareaHeight({ target: this.$refs.messageInput });
      });
    },

    async sendMessage() {
      if (!this.userInput.trim()) return;

      // 添加用户消息到聊天记录
      this.messages.push({
        sender: 'user',
        content: this.userInput,
        timestamp: this.getCurrentTime()
      });

      if (!this.isQuestionnaireComplete) {
        // 保存用户回答到对应字段
        const currentKey = this.currentQuestion.key;
        this.carRequirements[currentKey] = this.userInput.trim();
        
        // 移动到下一个问题
        this.currentQuestionIndex++;
        
        // 如果还有问题，提出下一个问题
        if (this.currentQuestionIndex < this.questions.length) {
          this.messages.push({
            sender: 'system',
            content: this.currentQuestion.text,
            timestamp: this.getCurrentTime()
          });
        } else {
          // 所有问题都已回答，生成推荐
          this.generateRecommendation();
        }
      } else {
        // 问卷已完成，处理后续对话
        await this.handleFollowUpConversation();
      }

      // 清空输入框
      this.userInput = '';
      
      // 重置输入框高度
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.style.height = '44px';
        }
      });

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 生成推荐结果
    async generateRecommendation() {
      // 显示收集到的信息
      let summary = '感谢您提供的信息，您当前的购车需求如下：\n';
      summary += `预算范围：${this.carRequirements.budget_range || '未提供'}\n`;
      summary += `品牌偏好：${this.carRequirements.brand_preference || '未提供'}\n`;
      summary += `燃料类型：${this.carRequirements.fuel_type || '未提供'}\n`;
      summary += `偏好车型：${this.carRequirements.preferred_type || '未提供'}\n`;
      summary += `使用场景：${this.carRequirements.use_case || '未提供'}\n\n`;
      summary += '正在为您推荐合适的车型...';

      this.messages.push({
        sender: 'system',
        content: summary,
        timestamp: this.getCurrentTime()
      });

      // 模拟调用推荐服务
      try {
        const response = await this.callRecommendationService(this.carRequirements);
        
        // 添加推荐结果到聊天记录
        this.messages.push({
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
        
        // 结束对话
        this.endConversation();
      } catch (error) {
        this.messages.push({
          sender: 'system',
          content: '抱歉，生成推荐时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
      }
    },

    // 处理后续对话
    async handleFollowUpConversation() {
      try {
        const response = await this.callLLMService(this.userInput);
        
        // 添加系统回复到聊天记录
        this.messages.push({
          sender: 'system',
          content: response,
          timestamp: this.getCurrentTime()
        });
        
        // 结束对话
        this.endConversation();
      } catch (error) {
        this.messages.push({
          sender: 'system',
          content: '抱歉，处理您的请求时出现错误，请稍后重试。',
          timestamp: this.getCurrentTime()
        });
      }
    },

    // 结束对话
    endConversation() {
      this.isConversationEnded = true;
      
      // 添加结束语
      this.messages.push({
        sender: 'system',
        content: '以上就是本次购车咨询的全部内容。如果您还有其他问题，欢迎随时联系我们。祝您购车愉快！',
        timestamp: this.getCurrentTime()
      });

      // 完成咨询奖励积分（例如 10 分）
      earnPoints(10, '完成一次购车咨询');
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 重新开始对话
    restartConversation() {
      // 重置所有状态
      this.carRequirements = {
        brand_preference: '',
        budget_range: '',
        fuel_type: '',
        preferred_type: '',
        use_case: ''
      };
      this.currentQuestionIndex = 0;
      this.isConversationEnded = false;
      this.userInput = '';
      
      // 清空聊天记录并重新初始化
      this.messages = [];
      
      // 初始化时提出第一个问题
      this.messages.push({
        sender: 'system',
        content: '您好！欢迎使用购车咨询服务。为了更好地为您推荐合适的车型，我需要了解一些您的购车需求。',
        timestamp: this.getCurrentTime()
      });
      
      this.messages.push({
        sender: 'system',
        content: this.currentQuestion.text,
        timestamp: this.getCurrentTime()
      });
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 调用推荐服务
    async callRecommendationService(requirements) {
      // 这里应该实际调用推荐API
      // 暂时返回模拟数据
      return `根据您的需求，我们为您推荐以下车型：
1. 丰田卡罗拉 - 经济实用，适合城市通勤
2. 本田思域 - 动力强劲，外观时尚
3. 大众朗逸 - 空间宽敞，适合家庭使用`;
    },

    // 调用LLM服务
    async callLLMService(query) {
      // 这里应该实际调用 LLMService.callAPI()
      // 暂时返回模拟数据
      return `感谢您的提问。基于您之前提供的购车需求，我可以为您提供更多相关信息。请问您还想了解哪些方面？`;
    },

    scrollToBottom() {
      const container = this.$refs.chatHistory;
      container.scrollTop = container.scrollHeight;
    },
    
    // 获取历史记录摘要
    getHistorySummary(record) {
      const budget = record.requirements.budget_range || '未提供';
      const brand = record.requirements.brand_preference || '未提供';
      const type = record.requirements.preferred_type || '未提供';
      return `${budget} | ${brand} | ${type}`;
    },
    
    // 选择历史记录查看详情
    selectHistoryRecord(record) {
      this.selectedRecord = record;
      this.showHistoryModal = false;
      this.showDetailModal = true;
    }
  },

  mounted() {
    // 初始化时提出第一个问题
    this.messages.push({
      sender: 'system',
      content: '您好！欢迎使用购车咨询服务。为了更好地为您推荐合适的车型，我需要了解一些您的购车需求。',
      timestamp: this.getCurrentTime()
    });
    
    this.messages.push({
      sender: 'system',
      content: this.currentQuestion.text,
      timestamp: this.getCurrentTime()
    });
    
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.15), transparent 60%),
              radial-gradient(800px 400px at 100% 10%, rgba(16,185,129,0.1), transparent 60%);
  padding: 20px;
  position: relative;
}

.history-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.history-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-button:hover {
  background: rgba(59,130,246,0.2);
  border-color: rgba(59,130,246,0.5);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148,163,184,0.15);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
  margin-bottom: 20px;
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.system {
  margin-right: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
}

.message.user .message-content {
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.system .message-content {
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  border: 1px solid rgba(148,163,184,0.25);
  border-bottom-left-radius: 6px;
}

.timestamp {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
  text-align: right;
  padding-right: 6px;
}

.input-area {
  display: flex;
  padding: 0;
  background: transparent;
  border: none;
  gap: 12px;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  resize: none;
  min-height: 44px;
  max-height: 150px;
  font-family: inherit;
  line-height: 1.5;
}

.input::placeholder {
  color: #6b7280;
}

.input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.95);
}

.input-hint {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 11px;
  color: #6b7280;
  pointer-events: none;
}

.send-button {
  padding: 0 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform .08s ease, filter .2s ease, opacity .2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  height: 44px;
}

.send-button:hover:not(:disabled) {
  filter: brightness(1.1);
}

.send-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-button:active:not(:disabled) {
  transform: translateY(1px);
  filter: brightness(0.95);
}

.end-conversation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148,163,184,0.15);
}

.end-message {
  color: #e5e7eb;
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.restart-button {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform .08s ease, filter .2s ease, opacity .2s ease;
}

.restart-button:hover {
  filter: brightness(1.1);
}

.restart-button:active {
  transform: translateY(1px);
  filter: brightness(0.95);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(15,23,42,0.95);
  border-radius: 12px;
  border: 1px solid rgba(148,163,184,0.25);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(148,163,184,0.15);
}

.modal-header h3 {
  margin: 0;
  color: #e5e7eb;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255,255,255,0.1);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  padding: 15px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.5);
  border: 1px solid rgba(148,163,184,0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(59,130,246,0.1);
  border-color: rgba(59,130,246,0.3);
}

.history-title {
  font-weight: bold;
  color: #e5e7eb;
  margin-bottom: 8px;
}

.history-summary {
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 8px;
}

.history-date {
  color: #6b7280;
  font-size: 12px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(148,163,184,0.15);
  display: flex;
  justify-content: flex-end;
}

.modal-close-button {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.85);
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background: rgba(59,130,246,0.2);
  border-color: rgba(59,130,246,0.5);
}

.detail-modal .detail-section {
  margin-bottom: 20px;
}

.detail-modal .detail-section h4 {
  color: #e5e7eb;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(148,163,184,0.15);
  padding-bottom: 5px;
}

.requirement-item {
  display: flex;
  margin-bottom: 8px;
}

.requirement-item .label {
  color: #9ca3af;
  width: 100px;
  font-weight: 500;
}

.requirement-item span:last-child {
  color: #e5e7eb;
  flex: 1;
}

.recommendation-content {
  background: rgba(2, 6, 23, 0.5);
  border-radius: 8px;
  padding: 12px;
  color: #e5e7eb;
  white-space: pre-line;
  border: 1px solid rgba(148,163,184,0.15);
}

.conversation-detail {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(2, 6, 23, 0.3);
  border-radius: 8px;
  padding: 10px;
}

.conversation-detail .message {
  margin-bottom: 10px;
  max-width: 100%;
}

.conversation-detail .message-content {
  padding: 8px 12px;
  font-size: 13px;
}

.conversation-detail .timestamp {
  font-size: 10px;
  padding-right: 4px;
}
</style>