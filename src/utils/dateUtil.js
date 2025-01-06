import { format, isSameDay } from 'date-fns';

/**
 * 將YYYY/MM/DD格式轉換為YYYY-MM-DD格式
 * @param {string} dateString - 日期字串 (格式為YYYY/MM/DD)
 * @returns {string} 格式化後的日期 (格式為YYYY-MM-DD)
 */
export const formatDateForAPI = (dateString) => {
  const [year, month, day] = dateString.split('/');
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * 將訊息陣列根據日期插入日期提示
 * @param {Array} messages - 訊息陣列，每個訊息包含 createdAt 
 * @returns {Array} 帶有日期提示的訊息陣列
 */
export const addDateSeparators = (messages) => {
  if (!messages || messages.length === 0) return [];

  const result = [];
  let previousDate = null;

  // 過濾掉 `date-separator` 類型的消息，只處理普通消息
  const filteredMessages = messages.filter((message) => message.type !== 'date-separator');

  filteredMessages.forEach((message) => {
    const messageDate = new Date(message.createdAt);

    // 如果與前一條訊息的日期不同，插入日期提示
    if (!previousDate && !isSameDay(previousDate, messageDate)) {
      console.log('messageDate',messageDate);
      
      result.push({
        type: 'date-separator',
        date: format(messageDate, 'MM月dd日'), // 格式化為 "12月07日"
      });
      previousDate = messageDate;
    }

    // 添加訊息本身
    result.push({
      ...message,
      type: 'message', // 標識為普通訊息
    });
  });

  return result;
};

