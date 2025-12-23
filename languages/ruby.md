# Ruby

**Manager:** rbenv | **Default:** 3.4.6 | **Location:** `/.sprite/languages/ruby/rbenv`

## Version Management

```bash
rbenv versions          # List installed
rbenv install 3.3.0     # Install
rbenv global 3.3.0      # Set default
rbenv local 3.2.0       # Project-specific
rbenv rehash            # After installing gems with executables
```

## Project Version

Create `.ruby-version`:
```
3.3.0
```

## Gems

```bash
gem install rails
bundle install
bundle add sinatra
```
