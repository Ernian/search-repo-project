const repoContainer = document.getElementById('repo-container')
const form = document.forms['search-form']
const repoLabel = document.getElementById('repo-label')
const repoInput = document.getElementById('repo-input')
const selectLimit = document.getElementById('select-limit')

form.addEventListener('submit', submitHandler)
repoInput.addEventListener('focus', resetQueryError)

function submitHandler(event) {
  event.preventDefault()
  const queryObject = getQueryObject()
  if (isValidQuery(queryObject)) {
    clearRepoContainer()
    showLoadingMessage()
    fetchRepositories(queryObject)
  } else {
    queryErrorHandler()
  }
}

function getQueryObject() {
  return {
    query: repoInput.value.trim(),
    limit: selectLimit.value
  }
}

function isValidQuery({ query, limit }) {
  return !!query && !!limit
}

function clearRepoContainer() {
  repoContainer.innerHTML = ''
}

function showErrorMessage() {
  repoContainer.innerHTML = `<h2>Будьте бдительны - что-то пошло не так...
  Причины неизвестны, а последствия непредсказуемыヽ(°□° )ノ</h2>`
}

function showNotFoundMessage() {
  repoContainer.innerHTML = `<h2>Ничего не нашлось&nbsp;&nbsp;&nbsp;&nbsp;╮( ˘ ､ ˘ )╭</h2>`
}

function showLoadingMessage() {
  repoContainer.innerHTML = `<h2>Идет поиск...</h2>`
}


async function fetchRepositories({ query, limit = 10 }) {
  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=${limit}`)
    if (!response.ok) {
      clearRepoContainer()
      showErrorMessage()
      return
    }
    const { items } = await response.json()
    if (!items.length) {
      clearRepoContainer()
      showNotFoundMessage()
      return
    }

    clearRepoContainer()
    displayRepo(items)
  } catch (error) {
    clearRepoContainer()
    showErrorMessage()
  }
}

function displayRepo(repos) {
  const reposHTML = repos.map(({
    updated_at,
    description,
    full_name,
    html_url,
    language,
    stargazers_count }) => (`  
  <div class="card mb-3 shadow">
    <div class="card-body">
      <h5 class="card-title">
        <a href="${html_url}" target="_blank">${full_name}</a>
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">Обновлен: ${updated_at.slice(0, 10)}</h6>
      <h6 class="card-subtitle mb-2 text-muted">Язык: ${language || 'Не указан'}</h6>
      <h6 class="card-subtitle mb-2 text-muted">Количество звезд на Github: ${stargazers_count}</h6>
      <p class="card-text">Описание: ${description || 'Нет описания'}</p>
    </div>
  </div>
`)).join('')
  repoContainer.insertAdjacentHTML('afterbegin', reposHTML)
}

function queryErrorHandler() {
  repoLabel.classList.add('text-danger')
  repoLabel.textContent = 'Пожалуйста введите строку для поиска'
}

function resetQueryError() {
  repoLabel.classList.remove('text-danger')
  repoLabel.textContent = 'Поиск по репозиториям'
}