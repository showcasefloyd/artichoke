# Express Route Templates (`app/index.js`)

All routes follow the **exec-php bridge pattern**: `execPhp` opens `api.php`, then calls the PHP function by name.

---

## GET — by ID

```js
app.get('/publisher/:id', function(req, res) {
    execPhp(__dirname + '/api.php', function(error, php, data) {
        php.grabPublisher(req.params.id, function(err, result) {
            res.send(result);
        });
    });
});
```

## GET — list (no params)

```js
app.get('/publishers', function(req, res) {
    execPhp(__dirname + '/api.php', function(error, php, data) {
        php.grabPublishers(function(err, result) {
            res.send(result);
        });
    });
});
```

## POST — create

```js
app.post('/publisher', function(req, res) {
    execPhp(__dirname + '/api.php', function(error, php, data) {
        php.createPublisher(JSON.stringify(req.body), function(err, result) {
            res.send(result);
        });
    });
});
```

## PUT — update by ID

```js
app.put('/publisher/:id', function(req, res) {
    execPhp(__dirname + '/api.php', function(error, php, data) {
        php.updatePublisher(req.params.id, JSON.stringify(req.body), function(err, result) {
            res.send(result);
        });
    });
});
```

## DELETE — by ID

```js
app.delete('/publisher/:id', function(req, res) {
    execPhp(__dirname + '/api.php', function(error, php, data) {
        php.deletePublisher(req.params.id, function(err, result) {
            res.send(result);
        });
    });
});
```

---

## React fetch snippets

### GET on mount (inside useEffect)

```ts
useEffect(() => {
    fetch(`/publisher/${id}`)
        .then(r => r.json())
        .then((data: Publisher) => setPublisher(data))
        .catch(() => setError('Failed to load publisher'));
}, [id]);
```

### POST / PUT (form submit handler)

```ts
async function handleSave() {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch('/publisher', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const data: Publisher = await res.json();
        onSaved(data.id);
    } catch {
        setError('Save failed');
    } finally {
        setLoading(false);
    }
}
```

### DELETE (with confirmation)

```ts
async function handleDelete() {
    if (!window.confirm('Delete this publisher?')) return;
    setLoading(true);
    try {
        await fetch(`/publisher/${publisherId}`, { method: 'DELETE' });
        onDeleted();
    } catch {
        setError('Delete failed');
    } finally {
        setLoading(false);
    }
}
```

---

## Key rules

- `JSON.stringify(req.body)` is the canonical way to pass POST/PUT payloads to PHP.
- `res.send(result)` — never transform or re-encode `result`; PHP already returns valid JSON.
- Add new routes **near existing routes for the same resource** to keep `app/index.js` organised.
- `bodyParser.json()` is already registered globally — do not add it again per-route.
