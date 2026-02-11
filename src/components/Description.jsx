export default function Description() {
  return (
    <section className="app__fulldescription app__section container">
      <div>
        <h2>Apollo for Reddit</h2>
        <p>
          Apollo is a beautiful and powerful Reddit app designed for fast navigation, customizability, and a seamless
          browsing experience. Built with iOS design guidelines in mind, Apollo fits right at home on your device and
          offers a super-charged Media Viewer, fully customizable gestures, and much more. This version of Apollo has
          been tweaked with ImprovedCustomApi, which allows the app to use your own Reddit API credentials.
        </p>
        <h2>ImprovedCustomApi</h2>
        <p>
          <strong>
            <a
              href="https://github.com/JeffreyCA/Apollo-ImprovedCustomApi"
              className="blue-link"
              target="_blank"
              rel="noreferrer"
            >
              ImprovedCustomApi
            </a>
          </strong>{' '}
          by{' '}
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
          is a tweak that allows you to use your own Reddit API credentials in Apollo.
        </p>
      </div>
    </section>
  )
}
