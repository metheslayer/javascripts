const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.width = '99%';
buttonContainer.style.justifyContent = 'space-between';

const selectButton = document.createElement('button');
selectButton.textContent = 'Select Files';
selectButton.style.backgroundColor = 'green';
selectButton.style.color = 'white';
selectButton.style.padding = '5px';
selectButton.style.border = 'none';
selectButton.style.borderRadius = '5px';
selectButton.style.margin = '5px';
selectButton.style.width = '49%';

const submitButton = document.createElement('button');
submitButton.textContent = 'Submit Next File';
submitButton.style.backgroundColor = 'blue';
submitButton.style.color = 'white';
submitButton.style.padding = '5px';
submitButton.style.border = 'none';
submitButton.style.borderRadius = '5px';
submitButton.style.margin = '5px';
submitButton.disabled = true;
submitButton.style.width = '49%';

buttonContainer.appendChild(selectButton);
buttonContainer.appendChild(submitButton);

const fileIndicator = document.createElement('p');
fileIndicator.textContent = 'No file selected';
fileIndicator.style.margin = '5px';

const progress = document.createElement('progress');
progress.style.width = '99%';
progress.style.height = '5px';
progress.style.backgroundColor = 'grey';

const progressBar = document.createElement('div');
progressBar.style.width = '0%';
progressBar.style.height = '100%';
progressBar.style.backgroundColor = 'blue';

progress.appendChild(progressBar);

const targetElement = document.querySelector('.flex.flex-col.w-full.py-2.flex-grow.md\\:py-3.md\\:pl-4');
targetElement.parentNode.insertBefore(progress, targetElement);
targetElement.parentNode.insertBefore(fileIndicator, targetElement);
targetElement.parentNode.insertBefore(buttonContainer, targetElement);

let files = [];
let fileIndex = 0;

async function submitConversation(text, part, filename) {
  const textarea = document.querySelector("textarea[tabindex='0']");
  const enterKeyEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
  });
  textarea.value = `Part ${part} of ${filename}:\n\n${text}`;
  textarea.dispatchEvent(enterKeyEvent);
}

let chatgptReady = false;

async function checkChatGPTReady() {
  while (!chatgptReady) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    chatgptReady = !document.querySelector('.text-2xl > span:not(.invisible)');
  }
  progressBar.style.backgroundColor = 'blue';
}

selectButton.addEventListener('click', async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.txt,.js,.py,.html,.css,.json,.csv';
  input.click();

  input.addEventListener('change', (event) => {
    files = Array.from(event.target.files);
    fileIndex = 0;
    if (files.length > 0) {
      fileIndicator.textContent = `Next file: ${files[fileIndex].name}`;
      submitButton.disabled = false;
    } else {
      fileIndicator.textContent = 'No file selected';
      submitButton.disabled = true;
    }
  });
});

submitButton.addEventListener('click', async () => {
  if (fileIndex < files.length) {
    const file = files[fileIndex];
    const reader = new FileReader();
    const chunkSize = 15000;
    let offset = 0;
    let part = 1;
    const readFile = (file) => new Promise((resolve) => {
      const readChunk = () => {
        const blob = file.slice(offset, offset + chunkSize);
        reader.readAsText(blob);
      };
      reader.onloadend = () => {
        const text = reader.result;
        submitConversation(text, part, file.name);
        progressBar.style.width = `${((part / Math.ceil(file.size / chunkSize)) * 100).toFixed(2)}%`;
        part++;
        offset += chunkSize;
        if (offset >= file.size) {
          resolve();
        } else {
          readChunk();
        }
      };
      readChunk();
    });
    await readFile(file);
    await checkChatGPTReady();
    fileIndex++;
    if (fileIndex < files.length) {
      fileIndicator.textContent = `Next file: ${files[fileIndex].name}`;
    } else {
      fileIndicator.textContent = 'All files have been submitted';
      submitButton.disabled = true;
    }
  }
});
