"""Legacy helper retained only to explain the new architecture.

The portal no longer seeds or stores its own jobs. Users are redirected to
external job platforms through live search links instead.
"""


def main() -> None:
    print("Job seeding is retired.")
    print("This portal now uses external job platforms instead of storing local job posts.")


if __name__ == "__main__":
    main()
