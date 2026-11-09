// Góp ý & báo lỗi — form ẩn danh gửi qua Formspree (không cần backend,
// không bắt buộc tài khoản Git hay email). Mỗi trang chi tiết có 1 form với
// data-formspree trỏ tới form Formspree tương ứng (hoặc dùng chung 1 form,
// phân biệt bằng trường ẩn "app").
//
// Chủ dự án: thay PLACEHOLDER_FORM_ID bằng Form ID thật (miễn phí tại
// https://formspree.io → New Form). Khi chưa thay, form sẽ KHÔNG gửi dữ liệu
// đi mà hiện hướng dẫn cho người dùng dùng link GitHub Issues bên cạnh.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  const app = form.dataset.app || 'Pabhassara Lab';
  const endpoint = form.dataset.formspree || '';

  const tabs = form.querySelectorAll('.ftype-btn');
  const typeInput = form.querySelector('[name="type"]');
  const subjectInput = form.querySelector('[name="_subject"]');
  const detailLabel = form.querySelector('[data-detail-label]');
  const detailField = form.querySelector('[name="details"]');
  const messageField = form.querySelector('[name="message"]');
  const status = form.querySelector('.form-status');
  const submitBtn = form.querySelector('.feedback-submit');
  const submitLabel = submitBtn.textContent;

  const modes = {
    bug: {
      subject: `[Bug] ${app} — báo lỗi từ Pabhassara Lab`,
      detailLabel: 'Các bước tái hiện',
      detailPlaceholder: '1. Mở app… 2. Chạm vào… 3. Điều gì xảy ra…',
      messagePlaceholder: 'Mô tả lỗi bạn gặp phải…'
    },
    enhancement: {
      subject: `[Đề xuất] ${app} — góp ý tính năng từ Pabhassara Lab`,
      detailLabel: 'Vấn đề cần giải quyết',
      detailPlaceholder: 'Điều gì đang khiến việc học khó hơn với bạn?',
      messagePlaceholder: 'Tôi muốn…'
    }
  };

  const setMode = (mode) => {
    if (!modes[mode]) mode = 'bug';
    tabs.forEach((tab) => {
      const active = tab.dataset.type === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    typeInput.value = mode;
    subjectInput.value = modes[mode].subject;
    detailLabel.textContent = modes[mode].detailLabel;
    detailField.placeholder = modes[mode].detailPlaceholder;
    messageField.placeholder = modes[mode].messagePlaceholder;
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.type)));
  setMode('bug');

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ` is-${kind}` : '');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!messageField.value.trim()) {
      setStatus('Vui lòng mô tả nội dung trước khi gửi.', 'err');
      messageField.focus();
      return;
    }

    // Chưa cấu hình Formspree ID → không gửi đi, hướng dẫn dùng kênh GitHub.
    if (endpoint.indexOf('PLACEHOLDER') !== -1) {
      setStatus('Kênh gửi ẩn danh đang được cấu hình (chủ dự án chưa thay Formspree ID). Trong lúc này, bạn vui lòng dùng link “Tạo issue trên GitHub” ngay bên dưới.', 'warn');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi…';
    setStatus('', '');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        setMode('bug');
        setStatus('Cảm ơn bạn! Góp ý đã được gửi tới chủ dự án. 🙏', 'ok');
      } else {
        setStatus('Gửi chưa thành công. Vui lòng thử lại, hoặc dùng link GitHub Issues bên dưới.', 'err');
      }
    } catch (error) {
      setStatus('Không kết nối được dịch vụ gửi góp ý. Vui lòng thử lại, hoặc dùng link GitHub Issues bên dưới.', 'err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
});
