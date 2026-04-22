# PHP Function Templates (`app/api.php`)

All functions go at **file scope**. `exec-php` calls them by name.

---

## GET — fetch one record by ID

```php
function grabPublisher($id) {
    require_once 'lib/global.inc';
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    echo json_encode([
        'id'   => $publisher->id(),
        'name' => $publisher->name(),
    ]);
}
```

## GET — fetch a list

```php
function grabPublishers() {
    require_once 'lib/global.inc';
    $publishers = new ComicDB_Publishers();
    $publishers->restore();
    $list = [];
    foreach ($publishers->publishers() as $p) {
        $list[] = ['id' => $p->id(), 'name' => $p->name()];
    }
    echo json_encode(['publishers' => $list]);
}
```

## POST — create a record

```php
function createPublisher($dataJson) {
    require_once 'lib/global.inc';
    $data = json_decode($dataJson, true);
    $publisher = new ComicDB_Publisher();
    $publisher->name($data['name']);
    if (isset($data['country'])) { $publisher->country($data['country']); }
    $publisher->save();
    echo json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}
```

## PUT — update a record

```php
function updatePublisher($id, $dataJson) {
    require_once 'lib/global.inc';
    $data = json_decode($dataJson, true);
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    if (isset($data['name']))    { $publisher->name($data['name']); }
    if (isset($data['country'])) { $publisher->country($data['country']); }
    $publisher->save();
    echo json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}
```

## DELETE — remove a record

```php
function deletePublisher($id) {
    require_once 'lib/global.inc';
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    $publisher->remove();
    echo json_encode(['deleted' => true, 'id' => $id]);
}
```

---

## Key rules

- Always `require_once 'lib/global.inc'` at the top of every function (sets up DB and autoloading).
- Use `json_decode($dataJson, true)` — the second argument gives an associative array, not `stdClass`.
- Use `$object->save()` (dispatches to `insert`/`update` based on lifecycle flags).
- Use `$object->remove()` for deletes (sets `isDeleted=1` then calls `save()`).
- Never `echo` anything other than the final `json_encode(...)` — stray output breaks exec-php.
