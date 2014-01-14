<?php

	$dir = new DirectoryIterator(dirname("."));

	echo "<h1>Registered Behaviours</h1>";
	
	echo "<ul>";

	foreach ($dir as $fileinfo) {

	    if (!$fileinfo->isDot() && $fileinfo->getExtension() == "json" && file_exists(str_replace("json", "js", $fileinfo->getFilename()))) {
	        // var_dump($fileinfo->getFilename());

	    	$json = json_decode(file_get_contents($fileinfo->getFilename()), true);

	    	echo "<li>";

	    	echo "<h2>" . $json["name"] . "</h2>";
	    	echo "<h3>Requires</h3>";
	    	echo "<p>" . implode(", ", $json["requires"]) . "</p>";
	    	echo "<h3>Description</h3>";
	    	echo "<p>" . $json["description"] . "</p>";

	    	echo "</li>";


	    }
	}

	echo "</ul>"

?>