<?php
include_once "ComicDB/DB.php";
include_once "ComicDB/Object.php";
include_once "ComicDB/Serieses.php";

class ComicDB_Title extends ComicDB_Object
{

    // Class for one title at a time

    public $name;

    public function __construct(...$args)
    {

        $this->ComicDB_Title(...$args);

    }

    public function ComicDB_Title($id = null)
    {
        $this->ComicDB_Object($id);
    }

    // Accessors

    public function name($name = null)
    {
        if ($name) {
            $this->name    = $name;
            $this->isDirty = 1;
        }
        return $this->name;
    }

    // Interface methods

    public function select()
    {
        $query = "SELECT id, name FROM titles WHERE id=$this->id";

        $db = ComicDB_DB::db();
        $db->query($query);
        if (! $result = $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $row = $result->fetch_array();

        $this->id($row[0]);
        $this->name($row[1]);

        return $row;
    }

    public function insert()
    {
        $name  = $this->name();
        $query = <<<EOT
			INSERT INTO titles
		     VALUES (NULL, '$name')
EOT;

        $db = ComicDB_DB::db();
        if (! $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        // is there a better portable way of retrieving the id?
        $query = <<<EOT
			  SELECT id
		    FROM titles
			ORDER BY id DESC
			  LIMIT 1
EOT;

        if (! $result = $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        $row = $result->fetch_assoc();
        $this->id($row['id']);

        return;
    }

    public function update()
    {
        $id    = $this->id();
        $name  = $this->name();
        $query = <<<EOT
				UPDATE titles
				SET name='$name'
				WHERE id=$id
EOT;

        $db = ComicDB_DB::db();
        return $db->query($query);
    }

    public function delete()
    {
        // first remove all series for this title
        $series = new ComicDB_Serieses($this->id());
        $rv     = $series->removeAll();
        if (PEAR::isError($rv)) {
            return $rv;
        }

        // then remove the title itself
        $id    = $this->id();
        $query = <<<EOT
				DELETE FROM titles
			    WHERE id=$id
EOT;

        $db = ComicDB_DB::db();
        return $db->query($query);
    }
}
