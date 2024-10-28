// Extension 1: VideoExtension
const VideoExtension = {
  name: 'Video',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_video' || trace.payload.name === 'ext_video',
  render: ({ trace, element }) => {
    const videoElement = document.createElement('video');
    const { videoURL, autoplay, controls } = trace.payload;

    videoElement.width = 240;
    videoElement.src = videoURL;

    if (autoplay) {
      videoElement.setAttribute('autoplay', '');
    }
    if (controls) {
      videoElement.setAttribute('controls', '');
    }

    videoElement.addEventListener('ended', function () {
      window.voiceflow.chat.interact({ type: 'complete' });
    });

    element.appendChild(videoElement);
  },
};

// Extension 2: DisableInputExtension
const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' ||
    trace.payload.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload;

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat');

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot;
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input');
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          );
          const button = shadowRoot.querySelector('.vfrc-chat-input--button');

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style');
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = 'vf-disable-input-style';
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `;
              shadowRoot.appendChild(styleTag);
            }

            function updateInputState() {
              textarea.disabled = isDisabled;
              if (!isDisabled) {
                textarea.placeholder = 'Message...';
                chatInput.classList.remove('vf-no-border');
                button.classList.remove('vf-hide-button');
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                );
              } else {
                textarea.placeholder = '';
                chatInput.classList.add('vf-no-border');
                button.classList.add('vf-hide-button');
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return '';
                  },
                  configurable: true,
                });
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              );
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              );
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            );

            // Initial update
            updateInputState();
          } else {
            console.error('Chat input, textarea, or button not found');
          }
        } else {
          console.error('Shadow root not found');
        }
      } else {
        console.error('Chat div not found');
      }
    }

    disableInput();
  },
};

// Extension 3: FileUploadExtension
const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_fileUpload' || trace.payload.name === 'ext_fileUpload',
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement('div');
    fileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(87, 24, 54, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Cick to upload a file</div>
      <input type='file' style='display: none;'>
    `;

    const fileInput = fileUploadContainer.querySelector('input[type=file]');
    const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload');

    fileUploadBox.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      console.log('File selected:', file);

      fileUploadContainer.innerHTML = `
        <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif"
             alt="Upload" width="50" height="50">
      `;

      var data = new FormData();
      data.append('file', file);

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Upload failed: ' + response.statusText);
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML = `
            <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif"
                 alt="Done" width="50" height="50">
          `;
          console.log('File uploaded:', result.data.url);
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          });
        })
        .catch((error) => {
          console.error(error);
          fileUploadContainer.innerHTML = '<div>Error during upload</div>';
        });
    });

    element.appendChild(fileUploadContainer);
  },
};

// Extension 4: FormExtension Norwegian
const FormExtensionNo = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'Custom_Form_No' || trace.payload.name === 'Custom_Form_No',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form');

    formContainer.innerHTML = `
      <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
      form {
      font-family: 'Roboto', sans-serif;
    max-width: 100%;
    margin: auto;
    padding: 0px;
    background-color: transparent;
    border-radius: 8px;
  }

  label {
    font-size: 1em;
    color: #333;
    display: block;
    margin: 10px 0 5px;
    font-weight: 500;
  }

  input[type="text"], input[type="email"], textarea {
    width: 100%;
    border: 2px solid #003677; /* Tykkere kant med ny farge */
    background-color: #fff;
    color: #333;
    margin: 10px 0;
    padding: 10px;
    outline: none;
    font-size: 1em;
    font-family: Arial, sans-serif; /* Bytter til Arial */
    border-radius: 8px; /* Avrundede hjørner */
    box-sizing: border-box;
  }

  textarea {
    height: 100px;
  }

  .invalid {
    border-color: red;
  }

  .submit {
    background-color: #003677; /* Ny farge */
    border: none;
    color: white;
    padding: 12px;
    border-radius: 8px; /* Avrundede hjørner */
    margin-top: 20px;
    width: 100%;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
  }
      </style>

      <label for="email">E-post</label>
      <input type="email" class="email" name="email" required
             pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
             title="Ugyldig e-post"><br><br>

      <label for="topic">Topic</label>
      <input type="text" class="topic" name="Tema" required><br><br>

      <label for="userQuestion">Question</label>
      <textarea class="userQuestion" name="userQuestion" required></textarea><br><br>

      <input type="submit" class="submit" value="Send inn">
    `;

    // Prefill the form fields with the variables from trace.payload
    const emailInput = formContainer.querySelector('.email');
    const topicInput = formContainer.querySelector('.topic');
    const userQuestionInput = formContainer.querySelector('.userQuestion');

    emailInput.value = trace.payload.email || '';
    topicInput.value = trace.payload.topic || '';
    userQuestionInput.value = trace.payload.userQuestion || '';

    formContainer.addEventListener('input', function () {
      // Remove 'invalid' class when input becomes valid
      if (emailInput.checkValidity()) emailInput.classList.remove('invalid');
      if (topicInput.checkValidity()) topicInput.classList.remove('invalid');
      if (userQuestionInput.checkValidity()) userQuestionInput.classList.remove('invalid');
    });

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault();

      if (
        !emailInput.checkValidity() ||
        !topicInput.checkValidity() ||
        !userQuestionInput.checkValidity()
      ) {
        if (!emailInput.checkValidity()) emailInput.classList.add('invalid');
        if (!topicInput.checkValidity()) topicInput.classList.add('invalid');
        if (!userQuestionInput.checkValidity()) userQuestionInput.classList.add('invalid');
        return;
      }

      formContainer.querySelector('.submit').remove();

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          email: emailInput.value,
          topic: topicInput.value,
          userQuestion: userQuestionInput.value,
        },
      });
    });

    element.appendChild(formContainer);
  },
};

// Extension 5: FormExtension English
const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'Custom_Form' || trace.payload.name === 'Custom_Form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form');

    formContainer.innerHTML = `
      <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
      form {
      font-family: 'Roboto', sans-serif;
    max-width: 100%;
    margin: auto;
    padding: 0px;
    background-color: transparent;
    border-radius: 8px;
  }

  label {
    font-size: 1em;
    color: #333;
    display: block;
    margin: 10px 0 5px;
    font-weight: 500;
  }

  input[type="text"], input[type="email"], textarea {
    width: 100%;
    border: 2px solid #003677; /* Tykkere kant med ny farge */
    background-color: #fff;
    color: #333;
    margin: 10px 0;
    padding: 10px;
    outline: none;
    font-size: 1em;
    font-family: Arial, sans-serif; /* Bytter til Arial */
    border-radius: 8px; /* Avrundede hjørner */
    box-sizing: border-box;
  }

  textarea {
    height: 100px;
  }

  .invalid {
    border-color: red;
  }

  .submit {
    background-color: #003677; /* Ny farge */
    border: none;
    color: white;
    padding: 12px;
    border-radius: 8px; /* Avrundede hjørner */
    margin-top: 20px;
    width: 100%;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
  }
      </style>

      <label for="email">E-post</label>
      <input type="email" class="email" name="email" required
             pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
             title="Ugyldig e-post"><br><br>

      <label for="topic">Tema</label>
      <input type="text" class="topic" name="topic" required><br><br>

      <label for="userQuestion">Melding</label>
      <textarea class="userQuestion" name="userQuestion" required></textarea><br><br>

      <input type="submit" class="submit" value="Send inn">
    `;

    // Prefill the form fields with the variables from trace.payload
    const emailInput = formContainer.querySelector('.email');
    const topicInput = formContainer.querySelector('.topic');
    const userQuestionInput = formContainer.querySelector('.userQuestion');

    emailInput.value = trace.payload.email || '';
    topicInput.value = trace.payload.topic || '';
    userQuestionInput.value = trace.payload.userQuestion || '';

    formContainer.addEventListener('input', function () {
      // Remove 'invalid' class when input becomes valid
      if (emailInput.checkValidity()) emailInput.classList.remove('invalid');
      if (topicInput.checkValidity()) topicInput.classList.remove('invalid');
      if (userQuestionInput.checkValidity()) userQuestionInput.classList.remove('invalid');
    });

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault();

      if (
        !emailInput.checkValidity() ||
        !topicInput.checkValidity() ||
        !userQuestionInput.checkValidity()
      ) {
        if (!emailInput.checkValidity()) emailInput.classList.add('invalid');
        if (!topicInput.checkValidity()) topicInput.classList.add('invalid');
        if (!userQuestionInput.checkValidity()) userQuestionInput.classList.add('invalid');
        return;
      }

      formContainer.querySelector('.submit').remove();

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          email: emailInput.value,
          topic: topicInput.value,
          userQuestion: userQuestionInput.value,
        },
      });
    });

    element.appendChild(formContainer);
  },
};
