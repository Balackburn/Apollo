import { useEffect, useRef } from 'react'
import Tobi from '../tobi'
import { getImageUrl } from '../utils'

const screenshots = [1, 2, 3, 4, 5, 6, 7, 8]

export default function Screenshots() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      new Tobi()
    }
  }, [])

  return (
    <section className="app__screenshots app__section">
      <div className="container">
        <h1>Screenshots</h1>
      </div>
      <div className="app__screenshots-wrapper container-desktop">
        <div className="app__screenshots-list">
          {screenshots.map((num) => (
            <a
              key={num}
              className="lightbox"
              href={getImageUrl(`images/image_${num}.webp`)}
            >
              <img
                className="app__screenshot"
                src={getImageUrl(`images/image_${num}.webp`)}
                alt=""
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
