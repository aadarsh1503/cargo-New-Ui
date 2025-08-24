import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRightCircle } from 'react-icons/fi'; // A more prominent icon

// --- Card Data Array ---
const cardData = [
  {
    to: "/airFreight",
    videoSrc: "https://ik.imagekit.io/cviw7sztp/GVS%20CARGO/4566163-hd_1920_1080_24fps.mp4?updatedAt=1753010223085",
    imgSrc: "https://img.freepik.com/premium-photo/truck-loading-cargo-onto-airplane_629685-10175.jpg",
    alt: "Air Freight",
    title: "Air Freight",
    description: "With safety, speed and transparency, we collect, accommodate, ship, track and deliver anywhere in the world."
  },
  {
    to: "/roadFreight",
    videoSrc: "https://ik.imagekit.io/cviw7sztp/GVS%20CARGO/18749847-uhd_2560_1440_60fps%20(online-video-cutter.com)%20(1).mp4?updatedAt=1753010848519",
    imgSrc: "https://avatars.mds.yandex.net/i?id=6cfadd1edd5c9770f100d2b15852ed04_l-8526247-images-thumbs&ref=rim&n=13&w=2560&h=1707",
    alt: "Road Freight",
    title: "Road Freight",
    description: "We are widely consolidated to offer you our entire infrastructure in road freight transport services."
  },
  {
    to: "/seaFreight",
    videoSrc: "https://ik.imagekit.io/cviw7sztp/GVS%20CARGO/12028914_1920_1080_24fps.mp4?updatedAt=1753002720328",
    imgSrc: "https://avatars.mds.yandex.net/get-ydo/1523397/2a0000016c14ffe64d4a1618c43a5c5efeb5/diploma",
    alt: "Sea Freight",
    title: "Sea Freight",
    description: "We offer the best conditions for chartering ships for special cargo and/or IMO (Dangerous Goods)."
  }
];

// --- Component Start ---
const Cards = () => {
  return (
    <>
      {/* 
        This is the new engine. All the CSS for the "Kinetic Glass" design.
      */}
      <style>{`
        :root {
          --accent-color: #F59E0B; /* Your DarkYellow */
          --accent-glow: rgba(245, 158, 11, 0.7);
        }

        /* The background for the section */
        .kinetic-section-bg {
          background-color: #f0f2f5; /* A very clean, light grey */
          background-image:
            radial-gradient(at 27% 37%, hsla(215, 98%, 62%, 0.1) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsla(38, 98%, 72%, 0.1) 0px, transparent 50%),
            radial-gradient(at 75% 88%, hsla(340, 98%, 62%, 0.1) 0px, transparent 50%);
        }

        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, 2%); }
        }

        .kinetic-card {
          position: relative;
          height: 420px;
          overflow: hidden;
          background: #333; /* Fallback color */
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.4s ease;
          
          /* The futuristic shape */
          clip-path: polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%);
        }

        .kinetic-card:hover {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2), 0 0 30px var(--accent-glow);
        }

        .card-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: ken-burns 15s infinite alternate ease-in-out;
        }
        
        /* Stop the media animation and darken it on hover to focus on text */
        .group:hover .card-media {
          animation-play-state: paused;
          filter: brightness(0.6);
          transition: filter 0.4s ease;
        }
        
        /* The main content panel with glass effect */
        .content-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 38%; /* Initial height showing title and teaser */
          padding: 24px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px) saturate(1.2);
          -webkit-backdrop-filter: blur(10px) saturate(1.2);
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        /* Expand the panel on hover */
        .group:hover .content-panel {
          height: 75%;
        }

        .card-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          margin-bottom: 8px;
        }

        /* Container for the description to handle text truncation */
        .description-wrapper {
          color: #e2e8f0;
          height: 40px; /* Initial height for teaser */
          overflow: hidden;
          transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .group:hover .description-wrapper {
          height: 100px; /* Expanded height for full description */
        }
        
        /* The call-to-action button */
        .card-cta {
          position: absolute;
          bottom: 24px; 
          right: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-color);
          color: #1a1a1a;
          padding: 10px 18px;
          border-radius: 50px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s;
        }

        .group:hover .card-cta {
          opacity: 1;
          transform: translateY(0);
        }

        /* The amazing animated border */
        .kinetic-card::before, .kinetic-card::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
          background: transparent;
          transition: width 0.3s ease, height 0.3s ease;
        }
        
        .kinetic-card::before {
          border-top: 2px solid var(--accent-color);
          border-left: 2px solid var(--accent-color);
        }
        .kinetic-card::after {
          right: 0;
          bottom: 0;
          left: auto;
          top: auto;
          border-bottom: 2px solid var(--accent-color);
          border-right: 2px solid var(--accent-color);
        }

        .group:hover .kinetic-card::before, .group:hover .kinetic-card::after {
          width: 100%;
          height: 100%;
        }
      `}</style>
      
      {/* --- Main Component JSX --- */}
      <div className="kinetic-section-bg py-20 font-poppins">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mx-auto max-w-7xl px-4">
          {cardData.map((card, index) => (
            <Link key={index} to={card.to} className="group block">
              <div className="kinetic-card">
                {/* Video element with fallback to image */}
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="card-media"
                  poster={card.imgSrc}
                  onError={(e) => {
                    // If video fails to load, replace with img element
                    const container = e.target.parentElement;
                    const img = document.createElement('img');
                    img.src = card.imgSrc;
                    img.alt = card.alt;
                    img.className = 'card-media';
                    container.replaceChild(img, e.target);
                  }}
                >
                  <source src={card.videoSrc} type="video/mp4" />
                  {/* Fallback image will be shown if video can't load */}
                  <img src={card.imgSrc} alt={card.alt} className="card-media" />
                </video>
                
                {/* --- Animated Border --- */}
                <div className="content-panel">
                  <h3 className="card-title">{card.title}</h3>
                  <div className="description-wrapper">
                    <p className='-mt-1'>{card.description}</p>
                  </div>
                  <span className="card-cta">
                    View Details <FiArrowRightCircle size={20} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Cards;