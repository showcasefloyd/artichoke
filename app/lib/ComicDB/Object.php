<?php
include_once("DB.php");
//require_once("PEAR.php")
require_once("vendor/pear-pear.php.net/PEAR/PEAR.php");

class ComicDB_Object extends PEAR {

	var $id;
	var $isNew;
	var $isDirty;
	var $isDeleted;

	public function __construct(...$args) {

		$this->ComicDB_Object(...$args);

	}


	public function ComicDB_Object($id=null) {

		$this->PEAR();

		if (isset($id)) {
			$this->id = $id;
			$this->isNew = 0;
			$this->isDirty = 0;
		} else {
			$this->isNew = 1;
			$this->isDirty = 1;
		}

		$this->isDeleted = 0;
	}

	// accessor methods

	public function id($id=null) {
		if (isset($id)) {
			$this->id = $id;
			$this->isDirty = 1;
		}
		return $this->id;
	}

	// persistence methods

	public function restore() {

		$rv = $this->select();

		// if (DB::isError($rv)) {
		// 	return $rv;
		// }

		$this->isNew = 0;
		$this->isDirty = 0;
		$this->isDeleted = 0;

		return $rv;
	}

	public function save() {
		if (!($this->isDirty || $this->isDeleted)) {
			return DB_OK;
		}

		if ($this->isDeleted && !$this->isNew) {

			$rv = $this->delete();
			// if (DB::isError($rv)) {
			// 	return $rv;
			// }

			$this->isNew = 1;
			$this->isDirty = 0;
			$this->isDeleted = 0;

		} else if ($this->isNew) {

				$rv = $this->insert();
				// if (DB::isError($rv)) {
				// 	return $rv;
				// }

				$this->isNew = 0;
				$this->isDirty = 0;
				$this->isDeleted = 0;

			} else {

			$rv = $this->update();
			// if (DB::isError($rv)) {
			// 	return $rv;
			// }

			$this->isNew = 0;
			$this->isDirty = 0;
			$this->isDeleted = 0;
		}

		return $rv;
	}

	public function remove() {
		$this->isDeleted = 1;

		return $this->save();
	}

}

?>
