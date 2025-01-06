// 提供統一接收拋出之異常
import Swal from 'sweetalert2';
import { errorMessages } from './errorMessages';

export const handleApiError = (error, customMessage = null) => {
    if (error.response) {
        const { status, message, errorCode } = error.response.data;

        // 如果有自訂義的錯誤訊息，直接使用
        let userFriendlyMessage = customMessage;

        // 如果沒有傳入自訂義訊息，嘗試根據錯誤碼查找對應訊息
        if (!userFriendlyMessage && errorCode) {
            userFriendlyMessage = errorMessages[errorCode];
        }

        // 如果都找不到，再使用狀態碼的映射訊息
        if (!userFriendlyMessage) {
            userFriendlyMessage = errorMessages[status] || errorMessages.default;
        }

        Swal.fire({
            icon: 'error',
            title: '出現錯誤',
            text: userFriendlyMessage || message,
        });
    } else if (error.request) {
        Swal.fire({
            icon: 'error',
            title: '網路錯誤',
            text: '無法連接到伺服器，請稍後再試。',
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: '發生錯誤',
            text: error.message || '請稍後再試。',
        });
    }
};
