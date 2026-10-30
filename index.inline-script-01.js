(function(){
      var track = document.getElementById('newsSliderTrack');
      if (!track) return;

      var prevBtn = document.querySelector('#news-1-v5iWwJmVVz .news-slider-arrow.prev');
      var nextBtn = document.querySelector('#news-1-v5iWwJmVVz .news-slider-arrow.next');
      var scrollRaf = 0;
      var slideRaf = 0;
      var isSliding = false;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function getMaxScroll(){
        return Math.max(0, track.scrollWidth - track.clientWidth);
      }

      function clamp(value, min, max){
        return Math.min(Math.max(value, min), max);
      }

      function getStep(){
        var firstCard = track.querySelector('.item.features-image');
        if (!firstCard) return track.clientWidth;

        var rect = firstCard.getBoundingClientRect();
        var styles = window.getComputedStyle(firstCard);
        var marginLeft = parseFloat(styles.marginLeft) || 0;
        var marginRight = parseFloat(styles.marginRight) || 0;
        var step = rect.width + marginLeft + marginRight;

        return step > 0 ? step : track.clientWidth;
      }

      function setButtonState(){
        var maxScrollLeft = Math.max(0, getMaxScroll() - 2);

        if (prevBtn) prevBtn.disabled = isSliding || track.scrollLeft <= 2;
        if (nextBtn) nextBtn.disabled = isSliding || track.scrollLeft >= maxScrollLeft;
      }

      function requestButtonUpdate(){
        if (scrollRaf) return;
        scrollRaf = window.requestAnimationFrame(function(){
          scrollRaf = 0;
          setButtonState();
        });
      }

      function stopCurrentSlide(){
        if (slideRaf) {
          window.cancelAnimationFrame(slideRaf);
          slideRaf = 0;
        }
      }

      function finishSlide(){
        isSliding = false;
        track.classList.remove('is-sliding');
        setButtonState();
      }

      function animateTo(targetLeft){
        stopCurrentSlide();

        var startLeft = track.scrollLeft;
        var distance = targetLeft - startLeft;

        if (Math.abs(distance) < 1 || reduceMotion) {
          track.scrollLeft = targetLeft;
          finishSlide();
          return;
        }

        var startTime = window.performance.now();
        var duration = 260;
        isSliding = true;
        track.classList.add('is-sliding');
        setButtonState();

        function tick(now){
          var progress = clamp((now - startTime) / duration, 0, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          track.scrollLeft = startLeft + distance * eased;

          if (progress < 1) {
            slideRaf = window.requestAnimationFrame(tick);
          } else {
            slideRaf = 0;
            track.scrollLeft = targetLeft;
            finishSlide();
          }
        }

        slideRaf = window.requestAnimationFrame(tick);
      }

      function slide(direction){
        if (isSliding) return;

        var step = getStep();
        var maxScroll = getMaxScroll();
        var currentIndex = Math.round(track.scrollLeft / step);
        var targetIndex = currentIndex + direction;
        var targetLeft = clamp(targetIndex * step, 0, maxScroll);

        animateTo(targetLeft);
      }

      if (prevBtn) prevBtn.addEventListener('click', function(event){
        event.preventDefault();
        slide(-1);
      });
      if (nextBtn) nextBtn.addEventListener('click', function(event){
        event.preventDefault();
        slide(1);
      });

      track.addEventListener('scroll', requestButtonUpdate, { passive: true });
      window.addEventListener('resize', function(){
        stopCurrentSlide();
        finishSlide();
      });
      window.addEventListener('load', setButtonState);
      setButtonState();
    })();
