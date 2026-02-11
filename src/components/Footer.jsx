export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__container">
          <ul className="footer__links">
            <li className="footer__link">
              <p>
                This is not affiliated with{' '}
                <strong>
                  <a
                    href="https://apolloapp.io"
                    className="blue-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apollo
                  </a>
                </strong>{' '}
                or{' '}
                <strong>
                  <a
                    href="https://christianselig.com/"
                    className="blue-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Christian Selig
                  </a>
                </strong>
                , thank&apos;s to{' '}
                <strong>
                  <a
                    href="https://github.com/JeffreyCA"
                    className="blue-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @JeffreyCA
                  </a>
                </strong>{' '}
                for ImprovedCustomApi.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
