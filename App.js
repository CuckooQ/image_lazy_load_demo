import api from "./api.js";

class App {
  target;
  state;
  lazyloadThrottleTimeout;

  constructor(target) {
    this.target = target;
    this.initState();
    this.setEvent();
    this.render();
  }

  async initState() {
    this.state = {
      cats: [],
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  setEvent() {
    this.target.addEventListener("click", this.click.bind(this));
    document.addEventListener("scroll", this.lazyload.bind(this));
    window.addEventListener("resize", this.lazyload.bind(this));
    window.addEventListener("orientationChange", this.lazyload.bind(this));
  }

  template() {
    const { cats } = this.state;

    return `
      <button class="get-btn">고양이 가져오기</button>
      <div>
      ${cats
        .map(({ id, url }) => {
          return `
          <div class="cat-container">
            <img id=${id} alt="" class="lazy" data-src=${url} >
            <span>${id}</span>
          </div>`;
        })
        .join("")}
      </div>
      `;
  }

  async mounted() {}

  render() {
    this.target.innerHTML = this.template();
    this.mounted();
  }

  async click({ target }) {
    if (target === this.target.querySelector(".get-btn")) {
      const res = await api.getCats();
      this.setState({ cats: res.data });
      this.lazyload();
    }
  }

  lazyload() {
    const lazyLoadImgEls = document.querySelectorAll("img.lazy");

    const imgObserver = IntersectionObserver((entries, _observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgEl = entry.target;
          imgEl.src = imgEl.dataset.src;
          imgEl.classList.remove("lazy");
          imgObserver.unobserve(imgEl);
        }
      });
    });

    lazyLoadImgEls.forEach((imgEl) => {
      imgObserver.observe(imgEl);
    });
  }

  lazyload() {
    const lazyLoadImgEls = document.querySelectorAll("img.lazy");

    if ("IntersectionObserver" in window) {
      const imgObserver = new IntersectionObserver((entries, _observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgEl = entry.target;
            imgEl.src = imgEl.dataset.src;
            imgEl.classList.remove("lazy");
            imgObserver.unobserve(imgEl);
          }
        });
      });

      lazyLoadImgEls.forEach((imgEl) => {
        /*
        * 플레이스홀더 색상을 이미지의 평균 색으로 설정 
        * 동일 도메인 이미지에서 가능
        const rgb = this.getAverageRGB(image.dataset.src);
        image.getElementsByClassName.backgroundColor =
          "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
        */
        imgObserver.observe(imgEl);
      });
    } else {
      // IntersectionObserver가 동작 안하는 브라우저의 경우
      if (this.lazyloadThrottleTimeout) {
        clearTimeout(this.lazyloadThrottleTimeout);
      }

      this.lazyloadThrottleTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset;
        lazyLoadImgEls.forEach((imgEl) => {
          /*
          const rgb = this.getAverageRGB(image.dataset.src);
          image.getElementsByClassName.backgroundColor =
          "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
          */
          if (imgEl.offsetTop < window.innerHeight + scrollTop + 500) {
            imgEl.src = img.dataset.src;
            imgEl.classList.remove("lazy");
          }
        });
        /*
        if (lazyLoadImgEls.length == 0) {
          document.removeEventListener("scroll", this.lazyload);
          window.removeEventListener("resize", this.lazyload);
          window.removeEventListener("orientationChange", this.lazyload);
        }
        */
      }, 20);
    }
  }

  // 이미지 URL에서 평균 색상 가져오기
  getAverageRGB(url) {
    const blockSize = 5; // only visit every 5 pixels
    const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
    const canvas = document.createElement("canvas");
    const context = canvas.getContext && canvas.getContext("2d");
    let data;
    let width;
    let height;
    let i = -4;
    let length;
    let rgb = { r: 0, g: 0, b: 0 };
    let count = 0;

    if (!context) {
      return defaultRGB;
    }

    const imgEl = document.createElement("img");
    imgEl.src = url;
    height = canvas.height =
      imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width =
      imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
      data = context.getImageData(0, 0, width, height);
    } catch (e) {
      // csp error
      return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
    }

    rgb.r = Math.floor(rgb.r / count);
    rgb.g = Math.floor(rgb.g / count);
    rgb.b = Math.floor(rgb.b / count);

    return rgb;
  }
}

export default App;
