import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// 切换回使用Vite的URL导入功能来加载本地worker
// 这是最稳定、最高效的方式，可以避免网络问题和CORS策略的干扰
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * 从不同类型的文件中提取纯文本内容，并提供更健壮的错误处理。
 * @param {File} file - 用户上传的文件对象。
 * @returns {Promise<string>} - 一个解析为纯文本内容的 Promise。
 */
export const extractTextFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('读取文件时发生未知错误。'));
    };

    switch (fileExtension) {
      case 'pdf':
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            if (!arrayBuffer) {
              throw new Error("文件读取结果为空，无法解析PDF。");
            }
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + '\n';
            }
            resolve(fullText);
          } catch (error) {
            console.error('解析PDF时出错:', error);
            reject(new Error(`无法解析PDF文件: ${error.message || '请确保文件没有损坏'}`));
          }
        };
        reader.readAsArrayBuffer(file);
        break;

      case 'docx':
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            if (!arrayBuffer) {
              throw new Error("文件读取结果为空，无法解析Word文档。");
            }
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (error) {
            console.error('解析DOCX时出错:', error);
            reject(new Error(`无法解析Word文档: ${error.message || '请检查文件格式'}`));
          }
        };
        reader.readAsArrayBuffer(file);
        break;

      case 'txt':
      case 'md':
      case 'markdown':
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsText(file, 'UTF-8');
        break;

      default:
        reject(new Error(`不支持的文件类型: .${fileExtension}。`));
    }
  });
};
