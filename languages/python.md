# Python

**Manager:** pyenv | **Default:** 3.13.7 | **Location:** `/.sprite/languages/python/pyenv`

## Version Management

```bash
pyenv versions           # List installed
pyenv install 3.12.0     # Install
pyenv global 3.12.0      # Set default
pyenv local 3.11.0       # Project-specific
```

## Project Version

Create `.python-version`:
```
3.12.0
```

## Virtual Environments

```bash
python -m venv myenv
source myenv/bin/activate

# Or pipenv/poetry
pipenv install
poetry new myproject
```
