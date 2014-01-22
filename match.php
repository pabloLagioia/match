<?php

	if ( file_exists("match.json") ) {
		
		$list = json_decode(file_get_contents("match.json"), true);
		
		for ( $i = 0; $i < count($list); $i++ ) {

			$file = $list[$i] . ".js";
		
			if ( file_exists($file) ) {
		
				echo file_get_contents($file);
			
			}

		}
		
	}

?>